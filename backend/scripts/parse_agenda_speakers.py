#!/usr/bin/env python3
"""parse_agenda_speakers.py

Standalone utility that merges a conference agenda CSV and a speaker-tracker CSV
into a bare JSON array aligned with the backend EventItem schema.

Usage
-----
python backend/scripts/parse_agenda_speakers.py \\
    --agenda   "Conference Agenda.csv" \\
    --speakers "Speaker Tracker.csv" \\
    --output   event_items.json \\
    [--r2-base-url  https://pub-XXXX.r2.dev] \\
    [--headshot-map headshot_mapping.csv] \\
    [--strict]

Expected agenda CSV columns (0-indexed; first column is always blank):
  1  Start Time   2  End Time   3  Event   4  Session   5  Location

Expected speaker CSV columns:
  0  section-group flag (TRUE / blank)
  1  Session Name and Number
  2  Name
  3  Attending          ← skip row if not TRUE
  8  Institution
  12 Headshot           ← Google Drive URL; ignored at runtime
  13 Speaker Bio        ← not included in output (not in EventItem schema)

Output JSON shape per item (backend EventItem schema — id/event_id excluded):
  title, time (ISO 8601 naive local), location, speakers[],
  sponsor, link, description, cancelled, slides
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
from datetime import datetime, time as dt_time
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MONTHS: dict[str, int] = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12,
}

# Honorific prefixes stripped before deriving headshot filename
_HONORIFIC_PREFIX_RE = re.compile(
    r"^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?|rev\.?|capt\.?|gen\.?|lt\.?)\s+",
    re.IGNORECASE,
)

# Credential / generational suffixes stripped from end of name
_HONORIFIC_SUFFIX_RE = re.compile(
    r",?\s*(ph\.?d\.?|m\.?d\.?|j\.?d\.?|jr\.?|sr\.?|esq\.?|iii|ii|iv)\s*$",
    re.IGNORECASE,
)

# Minimum SequenceMatcher ratio accepted as a fuzzy title match
_FUZZY_THRESHOLD = 0.55

# Hard-coded overrides for pairs that differ too much for fuzzy matching.
# Keys and values are *normalised* titles (see normalize_title()).
_TITLE_OVERRIDES: dict[str, str] = {
    # Speaker CSV says "Collaborating", agenda says "Communicating"
    "collaborating with texas tribes": "communicating with texas tribes",
    # Session 11: completely different marketing title in each file
    "tamel societal shifts affecting the role of museums": (
        "evolving museums navigating societal shifts for a resilient future"
        " with the tam executive leaders affinity group"
    ),
    # Session 5: speaker CSV has "Academic Museums /" prefix not in agenda
    "academic museums  community museums and university partnerships": (
        "community museums and university partnerships"
    ),
}


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def _to_ascii(text: str) -> str:
    """Decompose unicode accents and drop non-ASCII bytes (é→e, ñ→n, etc.)."""
    return (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def normalize_title(title: str) -> str:
    """Return a lowercase, ASCII-safe, punctuation-collapsed string for comparison."""
    t = _to_ascii(title).lower()
    t = re.sub(r"[^a-z0-9 ]+", " ", t)   # replace punctuation/symbols with space
    t = re.sub(r"\s+", " ", t).strip()
    return t


def speaker_name_to_filename(raw_name: str) -> str:
    """
    Derive a URL-safe .jpg filename from a speaker display name.

    Examples
    --------
    'Dr. Jennifer Rogers'  → 'jennifer-rogers.jpg'
    'Marsha Hendrix Ph.D.' → 'marsha-hendrix.jpg'
    'Andrés R. Amado'      → 'andres-r-amado.jpg'
    'TAM Council'          → 'tam-council.jpg'
    """
    name = raw_name.strip()
    name = _HONORIFIC_PREFIX_RE.sub("", name)
    name = _HONORIFIC_SUFFIX_RE.sub("", name)
    name = _to_ascii(name).lower().strip()
    name = re.sub(r"[^a-z0-9]+", "-", name).strip("-")
    return f"{name}.jpg"


# ---------------------------------------------------------------------------
# Agenda CSV parsing
# ---------------------------------------------------------------------------

def _parse_time_str(raw: str) -> Optional[dt_time]:
    """Parse '9:45 AM' / '12:00 PM' into a dt_time object, or return None."""
    m = re.match(r"(\d{1,2}):(\d{2})\s*(am|pm)", raw.strip(), re.IGNORECASE)
    if not m:
        return None
    hour, minute, period = int(m.group(1)), int(m.group(2)), m.group(3).upper()
    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0
    return dt_time(hour, minute)


def _parse_date_header(raw: str) -> Optional[tuple[int, int, int]]:
    """
    Return (year, month, day) if raw looks like 'Monday, April 20, 2026'.
    Returns None otherwise.
    """
    m = re.search(
        r"(January|February|March|April|May|June|July|August|"
        r"September|October|November|December)\s+(\d{1,2}),?\s*(\d{4})",
        raw,
    )
    if not m:
        return None
    return int(m.group(3)), MONTHS[m.group(1)], int(m.group(2))


def parse_agenda(path: Path) -> dict[str, dict]:
    """
    Parse the agenda CSV.

    Returns a dict keyed by normalised session title:
      {
        "time":           datetime (naive local),
        "location":       str,
        "original_title": str   (raw text from the Session column),
      }

    Logic
    -----
    - Day-header rows (e.g. "Monday, April 20, 2026" in the Start Time column)
      update the rolling current date.
    - Start-time rows update the rolling current time.
    - Continuation rows (empty Start Time) inherit the previous block's time.
    - Session titles come from column 4 (Session); rows without one are skipped.
    - First occurrence of a normalised title wins (handles duplicate sub-headings).
    """
    lookup: dict[str, dict] = {}
    current_date: Optional[tuple[int, int, int]] = None   # (year, month, day)
    current_start: Optional[dt_time] = None

    with path.open(newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.reader(fh))

    for row in rows:
        while len(row) < 6:
            row.append("")

        col1 = row[1].strip()   # Start Time field
        session_col = row[4].strip()
        location_col = row[5].strip()

        # Skip the column-header row
        if col1 == "Start Time":
            continue

        # Day-header row?
        ymd = _parse_date_header(col1)
        if ymd:
            current_date = ymd
            current_start = None
            continue

        # Update rolling start time if one is present
        parsed_time = _parse_time_str(col1)
        if parsed_time:
            current_start = parsed_time

        # Only interested in rows that carry a session title
        if not session_col or not current_date or not current_start:
            continue

        dt = datetime(
            current_date[0], current_date[1], current_date[2],
            current_start.hour, current_start.minute,
        )
        key = normalize_title(session_col)
        if key not in lookup:
            lookup[key] = {
                "time": dt,
                "location": location_col,
                "original_title": session_col,
            }

    return lookup


# ---------------------------------------------------------------------------
# Speaker CSV parsing
# ---------------------------------------------------------------------------

def _strip_session_number(raw: str) -> str:
    """'1 - Collaborating with Texas Tribes' → 'Collaborating with Texas Tribes'."""
    return re.sub(r"^\d+\s*[-–]\s*", "", raw).strip()


def parse_speakers(path: Path) -> dict[str, dict]:
    """
    Parse the speaker-tracker CSV, skipping any speaker where Attending != TRUE.

    Returns a dict keyed by normalised stripped session title:
      {
        "original_title": str,        # stripped (no number prefix) title
        "speakers":       list[dict], # each: {name, institution}
      }
    """
    sessions: dict[str, dict] = {}

    with path.open(newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.reader(fh))

    for row in rows:
        while len(row) < 14:
            row.append("")

        flag_col      = row[0].strip()
        session_col   = row[1].strip()
        name_col      = row[2].strip()
        attending_col = row[3].strip()
        institution_col = row[8].strip()

        # Skip the column-header row
        if session_col == "Session Name and Number":
            continue

        # Skip section-group header rows (TRUE in first column)
        if flag_col.upper() == "TRUE":
            continue

        # Exclude non-attending speakers
        if attending_col.upper() != "TRUE":
            continue

        # Skip rows without a session or name
        if not session_col or not name_col:
            continue

        stripped = _strip_session_number(session_col)

        # Handle truncated titles ending with "…" or "..."
        if stripped.endswith("...") or stripped.endswith("…"):
            stripped = re.sub(r"[.…]+$", "", stripped).rstrip()

        key = normalize_title(stripped)

        if key not in sessions:
            sessions[key] = {"original_title": stripped, "speakers": []}

        sessions[key]["speakers"].append({
            "name": name_col,
            "institution": institution_col,
        })

    return sessions


# ---------------------------------------------------------------------------
# Session title matching
# ---------------------------------------------------------------------------

def _find_agenda_match(
    speaker_key: str,
    agenda_lookup: dict[str, dict],
) -> Optional[str]:
    """
    Return the best-matching agenda key for a normalised speaker session key.

    Tries in order:
      1. Exact match
      2. Hard-coded override map (_TITLE_OVERRIDES)
      3. Prefix / startswith (one title is a leading substring of the other)
      4. Fuzzy SequenceMatcher ratio above _FUZZY_THRESHOLD
    """
    # 1. Exact
    if speaker_key in agenda_lookup:
        return speaker_key

    # 2. Override map
    override = _TITLE_OVERRIDES.get(speaker_key)
    if override and override in agenda_lookup:
        return override

    # 3. Prefix / substring (handles truncated titles and "featuring …" suffixes)
    for agt_key in agenda_lookup:
        if agt_key.startswith(speaker_key) or speaker_key.startswith(agt_key):
            return agt_key

    # 4. Fuzzy
    best_key: Optional[str] = None
    best_score = 0.0
    for agt_key in agenda_lookup:
        score = SequenceMatcher(None, speaker_key, agt_key).ratio()
        if score > best_score:
            best_key, best_score = agt_key, score

    if best_score >= _FUZZY_THRESHOLD:
        return best_key

    return None


# ---------------------------------------------------------------------------
# Merge & build output items
# ---------------------------------------------------------------------------

def build_event_items(
    agenda_lookup: dict[str, dict],
    speaker_sessions: dict[str, dict],
    r2_base_url: str,
) -> tuple[list[dict], list[str]]:
    """
    Merge agenda timing/location with speaker data into event-item dicts.

    Returns (items, warnings).  warnings is a list of human-readable strings
    describing fuzzy matches and unresolved sessions.
    """
    items: list[dict] = []
    warnings: list[str] = []

    for speaker_key, session_data in speaker_sessions.items():
        matched_key = _find_agenda_match(speaker_key, agenda_lookup)

        if matched_key is None:
            warnings.append(
                f"UNMATCHED: speaker session '{session_data['original_title']}' "
                f"has no agenda entry — time/location will be empty."
            )
            agenda_entry = {
                "time": None,
                "location": "",
                "original_title": session_data["original_title"],
            }
        else:
            agenda_entry = agenda_lookup[matched_key]
            if matched_key != speaker_key:
                warnings.append(
                    f"FUZZY MATCH: '{session_data['original_title']}' "
                    f"→ '{agenda_entry['original_title']}'"
                )

        # Build speakers array with derived headshot filenames
        speakers_out = []
        for spk in session_data["speakers"]:
            filename = speaker_name_to_filename(spk["name"])
            headshot = (
                f"{r2_base_url.rstrip('/')}/{filename}"
                if r2_base_url
                else filename
            )
            speakers_out.append({
                "name": spk["name"],
                "institution": spk["institution"],
                "headshot": headshot,
            })

        dt: Optional[datetime] = agenda_entry.get("time")
        items.append({
            "title":       agenda_entry["original_title"],
            "time":        dt.isoformat() if dt else "",
            "location":    agenda_entry.get("location", ""),
            "speakers":    speakers_out,
            "sponsor":     None,
            "link":        None,
            "description": None,
            "cancelled":   False,
            "slides":      None,
        })

    return items, warnings


# ---------------------------------------------------------------------------
# Headshot mapping report
# ---------------------------------------------------------------------------

def write_headshot_map(
    speaker_sessions: dict[str, dict],
    r2_base_url: str,
    output_path: Path,
) -> None:
    """
    Write a CSV mapping each unique speaker name to their derived filename and
    final R2 URL.  Useful for batch-renaming downloaded Drive images before upload.
    """
    seen: set[str] = set()
    rows = []
    for session_data in speaker_sessions.values():
        for spk in session_data["speakers"]:
            name = spk["name"]
            if name in seen:
                continue
            seen.add(name)
            filename = speaker_name_to_filename(name)
            url = (
                f"{r2_base_url.rstrip('/')}/{filename}" if r2_base_url else filename
            )
            rows.append({
                "speaker_name":     name,
                "derived_filename": filename,
                "r2_url":           url,
            })

    # Sort alphabetically for easy scanning
    rows.sort(key=lambda r: r["speaker_name"].lower())

    with output_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh, fieldnames=["speaker_name", "derived_filename", "r2_url"]
        )
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description=(
            "Merge a conference agenda CSV and a speaker-tracker CSV into "
            "a JSON array of event items aligned with the backend schema."
        )
    )
    ap.add_argument("--agenda",       required=True, help="Path to Conference Agenda CSV")
    ap.add_argument("--speakers",     required=True, help="Path to Speaker Tracker CSV")
    ap.add_argument("--output",       default="event_items.json", help="Output JSON path (default: event_items.json)")
    ap.add_argument("--r2-base-url",  default="",    help="Cloudflare R2 public base URL (e.g. https://pub-XXXX.r2.dev)")
    ap.add_argument("--headshot-map", default="",    help="Optional: write headshot mapping CSV to this path")
    ap.add_argument(
        "--strict",
        action="store_true",
        help="Exit non-zero if any speaker session cannot be matched to the agenda",
    )
    args = ap.parse_args(argv)

    agenda_path   = Path(args.agenda)
    speakers_path = Path(args.speakers)
    output_path   = Path(args.output)

    if not agenda_path.exists():
        print(f"ERROR: agenda file not found: {agenda_path}", file=sys.stderr)
        return 1
    if not speakers_path.exists():
        print(f"ERROR: speakers file not found: {speakers_path}", file=sys.stderr)
        return 1

    print("Parsing agenda …")
    agenda_lookup = parse_agenda(agenda_path)
    print(f"  {len(agenda_lookup)} session slots indexed.")

    print("Parsing speakers …")
    speaker_sessions = parse_speakers(speakers_path)
    attending_count = sum(len(s["speakers"]) for s in speaker_sessions.values())
    print(f"  {len(speaker_sessions)} sessions, {attending_count} attending speakers.")

    print("Merging …")
    items, warnings = build_event_items(
        agenda_lookup, speaker_sessions, args.r2_base_url
    )

    if warnings:
        print(f"\n{'─' * 60}")
        print(f"  {len(warnings)} notice(s):")
        for w in warnings:
            print(f"  ⚠  {w}")
        print(f"{'─' * 60}\n")

    output_path.write_text(
        json.dumps(items, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"✓  Wrote {len(items)} event items → {output_path}")

    if args.headshot_map:
        hm_path = Path(args.headshot_map)
        write_headshot_map(speaker_sessions, args.r2_base_url, hm_path)
        print(f"✓  Wrote headshot mapping → {hm_path}")

    unmatched = [w for w in warnings if w.startswith("UNMATCHED")]
    if args.strict and unmatched:
        print(
            f"\nERROR: --strict mode active — {len(unmatched)} unmatched session(s).",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
