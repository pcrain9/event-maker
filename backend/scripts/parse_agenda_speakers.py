#!/usr/bin/env python3
"""Convert the TAM agenda CSV into event-item JSON.

This script maps the richer 2026 agenda export directly onto the backend
EventItem shape used by the API and admin tooling.

Usage
-----
python backend/scripts/parse_agenda_speakers.py \
    --agenda "agendas/TAM 2026 Annual Meeting Project Plan - RGV.xlsx - Detailed Schedule for Program.csv" \
    --output agendas/tam-2026-event-items.json

Notes
-----
- The agenda CSV now includes speaker data inline, so the legacy separate
  speaker-tracker input is no longer required.
- If --r2-base-url is omitted, the script attempts to read
  tam-events/.env -> VITE_CLOUDFLARE_BASE_URL.
- Output items align to the backend EventItem schema, excluding id/event_id.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
from datetime import datetime, time as dt_time
from pathlib import Path
from typing import Optional
from urllib.parse import quote


MONTHS: dict[str, int] = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12,
}

_HONORIFIC_PREFIX_RE = re.compile(
    r"^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?|rev\.?|capt\.?|gen\.?|lt\.?)\s+",
    re.IGNORECASE,
)
_HONORIFIC_SUFFIX_RE = re.compile(
    r",?\s*(ph\.?d\.?|m\.?d\.?|j\.?d\.?|jr\.?|sr\.?|esq\.?|iii|ii|iv)\s*$",
    re.IGNORECASE,
)
_FALSEY_HEADSHOT_VALUES = {"", "false", "no", "n", "0", "none", "n/a"}
_HEADSHOT_FILENAME_ENCODINGS = ("utf-8-sig", "cp850", "cp1252")
_HEADSHOT_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".jfif", ".webp"}


def _to_ascii(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")


def _clean_cell(value: str) -> str:
    value = value.replace("\ufeff", "").replace("\u00a0", " ")
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    value = re.sub(r"[ \t]+", " ", value)
    return value.strip()


def _normalize_speaker_lookup_name(raw_name: str) -> str:
    name = raw_name.strip()
    name = _HONORIFIC_PREFIX_RE.sub("", name)
    name = _HONORIFIC_SUFFIX_RE.sub("", name)
    name = _to_ascii(name).lower().strip()
    return re.sub(r"[^a-z0-9]+", " ", name).strip()


def speaker_name_to_filename(raw_name: str) -> str:
    name = _normalize_speaker_lookup_name(raw_name)
    name = re.sub(r"[^a-z0-9]+", "-", name).strip("-")
    return f"{name}.jpg"


def load_headshot_filename_map(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    raw = path.read_bytes()
    text = ""
    for encoding in _HEADSHOT_FILENAME_ENCODINGS:
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        text = raw.decode("utf-8", errors="ignore")

    headshot_map: dict[str, str] = {}
    for raw_line in text.splitlines():
        filename = _clean_cell(raw_line)
        if not filename:
            continue

        suffix = Path(filename).suffix.lower()
        if suffix not in _HEADSHOT_IMAGE_SUFFIXES:
            continue

        normalized_name = _normalize_speaker_lookup_name(Path(filename).stem)
        if normalized_name and normalized_name not in headshot_map:
            headshot_map[normalized_name] = filename

    return headshot_map


def resolve_headshot_filename(
    raw_name: str, headshot_filename_map: Optional[dict[str, str]] = None
) -> str:
    normalized_name = _normalize_speaker_lookup_name(raw_name)
    if headshot_filename_map and normalized_name in headshot_filename_map:
        return headshot_filename_map[normalized_name]
    return speaker_name_to_filename(raw_name)


def _parse_time_str(raw: str) -> Optional[dt_time]:
    match = re.match(r"(\d{1,2}):(\d{2})\s*(am|pm)", raw.strip(), re.IGNORECASE)
    if not match:
        return None

    hour = int(match.group(1))
    minute = int(match.group(2))
    period = match.group(3).upper()
    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0
    return dt_time(hour, minute)


def _parse_date_header(raw: str) -> Optional[tuple[int, int, int]]:
    match = re.search(
        r"(January|February|March|April|May|June|July|August|"
        r"September|October|November|December)\s+(\d{1,2}),?\s*(\d{4})",
        raw,
    )
    if not match:
        return None
    return int(match.group(3)), MONTHS[match.group(1)], int(match.group(2))


def _coalesce_title(event_value: str, session_value: str) -> str:
    return _clean_cell(session_value or event_value)


def _split_name_and_institution(name_value: str, institution_value: str) -> tuple[str, str]:
    name = _clean_cell(name_value)
    institution = _clean_cell(institution_value)

    if institution or "," not in name:
        return name, institution

    first, remainder = name.split(",", 1)
    return first.strip(), remainder.strip()


def _build_headshot_url(
    raw_value: str,
    speaker_name: str,
    r2_base_url: str,
    headshot_filename_map: Optional[dict[str, str]] = None,
) -> str:
    if not speaker_name:
        return ""

    cleaned = _clean_cell(raw_value)
    lowered = cleaned.lower()
    if cleaned.startswith("http://") or cleaned.startswith("https://"):
        return cleaned
    if lowered in _FALSEY_HEADSHOT_VALUES:
        return ""

    headshot_filename = quote(resolve_headshot_filename(speaker_name, headshot_filename_map))
    if r2_base_url:
        return f"{r2_base_url.rstrip('/')}/headshots/{headshot_filename}"
    return f"headshots/{headshot_filename}"


def _build_datetime(
    current_date: Optional[tuple[int, int, int]],
    current_start: Optional[dt_time],
    line_number: int,
    title: str,
    warnings: list[str],
) -> str:
    if current_date is None:
        warnings.append(
            f"LINE {line_number}: '{title}' has no active date header and was skipped."
        )
        return ""

    if current_start is None:
        warnings.append(
            f"LINE {line_number}: '{title}' is missing a start time; defaulted to 00:00."
        )
        current_start = dt_time(0, 0)

    dt = datetime(
        current_date[0],
        current_date[1],
        current_date[2],
        current_start.hour,
        current_start.minute,
    )
    return dt.isoformat()


def _normalize_nullable(value: str) -> Optional[str]:
    cleaned = _clean_cell(value)
    return cleaned or None


def _build_speaker(
    name_value: str,
    institution_value: str,
    headshot_value: str,
    r2_base_url: str,
    headshot_filename_map: Optional[dict[str, str]] = None,
) -> Optional[dict]:
    raw_name = _clean_cell(name_value)
    if not raw_name:
        return None

    name, institution = _split_name_and_institution(raw_name, institution_value)
    return {
        "name": name,
        "institution": institution,
        "headshot": _build_headshot_url(
            headshot_value,
            name,
            r2_base_url,
            headshot_filename_map,
        ),
    }


def detect_r2_base_url(repo_root: Path) -> str:
    env_path = repo_root / "tam-events" / ".env"
    if not env_path.exists():
        return ""

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "VITE_CLOUDFLARE_BASE_URL":
            return value.strip().strip('"').strip("'")
    return ""


def build_event_items_from_agenda(
    path: Path,
    r2_base_url: str,
    headshot_filename_map: Optional[dict[str, str]] = None,
) -> tuple[list[dict], list[str]]:
    items: list[dict] = []
    warnings: list[str] = []
    current_date: Optional[tuple[int, int, int]] = None
    current_start: Optional[dt_time] = None
    current_item: Optional[dict] = None

    with path.open(newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.reader(fh))

    for line_number, row in enumerate(rows, start=1):
        while len(row) < 11:
            row.append("")

        start_raw = _clean_cell(row[1])
        event_raw = _clean_cell(row[3])
        session_raw = _clean_cell(row[4])
        location_raw = _clean_cell(row[5])
        description_raw = _clean_cell(row[6])
        speaker_name_raw = _clean_cell(row[7])
        institution_raw = _clean_cell(row[8])
        headshot_raw = _clean_cell(row[9])
        sponsor_raw = _clean_cell(row[10])

        if start_raw == "Start Time":
            continue

        parsed_date = _parse_date_header(start_raw)
        if parsed_date:
            current_date = parsed_date
            current_start = None
            current_item = None
            continue

        parsed_start = _parse_time_str(start_raw)
        if parsed_start is not None:
            current_start = parsed_start

        title = _coalesce_title(event_raw, session_raw)
        introduces_item = any([title, location_raw, description_raw, sponsor_raw])

        if introduces_item:
            iso_time = _build_datetime(current_date, current_start, line_number, title, warnings)
            if not iso_time:
                current_item = None
                continue

            current_item = {
                "title": title,
                "time": iso_time,
                "location": _normalize_nullable(location_raw),
                "description": _normalize_nullable(description_raw),
                "sponsor": _normalize_nullable(sponsor_raw),
                "speakers": [],
                "link": None,
                "cancelled": False,
                "slides": None,
            }

            speaker = _build_speaker(
                speaker_name_raw,
                institution_raw,
                headshot_raw,
                r2_base_url,
                headshot_filename_map,
            )
            if speaker is not None:
                current_item["speakers"].append(speaker)

            items.append(current_item)
            continue

        if speaker_name_raw:
            if current_item is None:
                warnings.append(
                    f"LINE {line_number}: speaker '{speaker_name_raw}' had no active event item."
                )
                continue

            speaker = _build_speaker(
                speaker_name_raw,
                institution_raw,
                headshot_raw,
                r2_base_url,
                headshot_filename_map,
            )
            if speaker is not None:
                current_item["speakers"].append(speaker)
            if sponsor_raw and not current_item["sponsor"]:
                current_item["sponsor"] = sponsor_raw

    for item in items:
        if not item["speakers"]:
            item["speakers"] = None

    return items, warnings


def write_headshot_map(
    items: list[dict],
    output_path: Path,
    headshot_filename_map: Optional[dict[str, str]] = None,
) -> None:
    seen: set[str] = set()
    rows: list[dict[str, str]] = []

    for item in items:
        speakers = item.get("speakers") or []
        for speaker in speakers:
            name = speaker["name"]
            if name in seen:
                continue
            seen.add(name)
            rows.append(
                {
                    "speaker_name": name,
                    "derived_filename": resolve_headshot_filename(name, headshot_filename_map),
                    "headshot_url": speaker.get("headshot", ""),
                }
            )

    rows.sort(key=lambda row: row["speaker_name"].lower())

    with output_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["speaker_name", "derived_filename", "headshot_url"],
        )
        writer.writeheader()
        writer.writerows(rows)


def main(argv: list[str] | None = None) -> int:
    repo_root = Path(__file__).resolve().parents[2]
    default_r2_base_url = detect_r2_base_url(repo_root)
    headshot_filename_map = load_headshot_filename_map(repo_root / "agendas" / "filenames.txt")

    ap = argparse.ArgumentParser(
        description="Convert an agenda CSV into backend-compatible event-item JSON."
    )
    ap.add_argument("--agenda", required=True, help="Path to agenda CSV")
    ap.add_argument("--speakers", default="", help=argparse.SUPPRESS)
    ap.add_argument(
        "--output",
        default="event_items.json",
        help="Output JSON path (default: event_items.json)",
    )
    ap.add_argument(
        "--r2-base-url",
        default=default_r2_base_url,
        help="Cloudflare R2 public base URL",
    )
    ap.add_argument(
        "--headshot-map",
        default="",
        help="Optional: write a speaker headshot mapping CSV",
    )
    args = ap.parse_args(argv)

    agenda_path = Path(args.agenda)
    output_path = Path(args.output)

    if not agenda_path.exists():
        print(f"ERROR: agenda file not found: {agenda_path}", file=sys.stderr)
        return 1

    if args.speakers:
        print("NOTE: --speakers is ignored; the agenda CSV already includes speaker data.")

    items, warnings = build_event_items_from_agenda(
        agenda_path,
        args.r2_base_url,
        headshot_filename_map=headshot_filename_map,
    )

    if warnings:
        print(f"\n{'-' * 60}")
        print(f"  {len(warnings)} notice(s):")
        for warning in warnings:
            print(f"  ! {warning}")
        print(f"{'-' * 60}\n")

    output_path.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(items)} event items -> {output_path}")

    if args.headshot_map:
        headshot_map_path = Path(args.headshot_map)
        write_headshot_map(items, headshot_map_path, headshot_filename_map=headshot_filename_map)
        print(f"Wrote headshot mapping -> {headshot_map_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
