from __future__ import annotations

from datetime import datetime
from pathlib import Path
import json
import pprint
import random
import re


ROOT_DIR = Path(__file__).resolve().parents[1]
INPUT_PATH = ROOT_DIR / "2025_conference.ts"
OUTPUT_PATH = ROOT_DIR / "updated_2025_conference_data.py"
YEAR = 2025

MONTHS = {
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

HEADSHOT_MIN = 10
HEADSHOT_MAX = 80
HEADSHOT_URL_TEMPLATE = "https://mockmind-api.uifaces.co/content/human/{id}.jpg"
HEADSHOT_RANDOM = random.Random(2025)


def strip_js_comments(text: str) -> str:
	"""Remove // comments while preserving URLs inside strings."""
	out: list[str] = []
	in_string = False
	escape = False
	i = 0
	while i < len(text):
		char = text[i]
		if in_string:
			out.append(char)
			if escape:
				escape = False
			elif char == "\\":
				escape = True
			elif char == '"':
				in_string = False
			i += 1
			continue
		if char == '"':
			in_string = True
			out.append(char)
			i += 1
			continue
		if char == "/" and i + 1 < len(text) and text[i + 1] == "/":
			while i < len(text) and text[i] != "\n":
				i += 1
			continue
		out.append(char)
		i += 1
	return "".join(out)


def quote_object_keys(text: str) -> str:
	"""Quote unquoted object keys so the content can be parsed as JSON."""
	out: list[str] = []
	in_string = False
	escape = False
	i = 0
	while i < len(text):
		char = text[i]
		if in_string:
			out.append(char)
			if escape:
				escape = False
			elif char == "\\":
				escape = True
			elif char == '"':
				in_string = False
			i += 1
			continue
		if char == '"':
			in_string = True
			out.append(char)
			i += 1
			continue
		if char.isalpha() or char == "_":
			start = i
			i += 1
			while i < len(text) and (text[i].isalnum() or text[i] == "_"):
				i += 1
			identifier = text[start:i]
			j = i
			while j < len(text) and text[j].isspace():
				j += 1
			if j < len(text) and text[j] == ":":
				out.append(f'"{identifier}"')
				continue
			out.append(identifier)
			continue
		out.append(char)
		i += 1
	return "".join(out)


def remove_trailing_commas(text: str) -> str:
	"""Strip trailing commas before } or ] so JSON parsing succeeds."""
	out: list[str] = []
	in_string = False
	escape = False
	i = 0
	while i < len(text):
		char = text[i]
		if in_string:
			out.append(char)
			if escape:
				escape = False
			elif char == "\\":
				escape = True
			elif char == '"':
				in_string = False
			i += 1
			continue
		if char == '"':
			in_string = True
			out.append(char)
			i += 1
			continue
		if char == ",":
			j = i + 1
			while j < len(text) and text[j].isspace():
				j += 1
			if j < len(text) and text[j] in "]}":
				i += 1
				continue
		out.append(char)
		i += 1
	return "".join(out)


def load_accordion_data() -> list[dict]:
	raw = INPUT_PATH.read_text(encoding="utf-8")
	if "export const accordionProps" in raw:
		raw = raw.split("export const accordionProps =", 1)[1]
	raw = raw.strip()
	if raw.endswith(";"):
		raw = raw[:-1]
	raw = strip_js_comments(raw)
	raw = re.sub(r"\bLINK_TITLE\b", '"Link"', raw)
	raw = quote_object_keys(raw)
	raw = remove_trailing_commas(raw)
	return json.loads(raw)


def parse_day_title(title: str) -> tuple[int, int]:
	match = re.search(
		r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})",
		title,
	)
	if not match:
		raise ValueError(f"Unable to parse date from day title: {title}")
	month = MONTHS[match.group(1)]
	day = int(match.group(2))
	return month, day


def parse_start_time(time_value: str) -> datetime:
	match = re.search(r"(\d{1,2}:\d{2}\s*(?:am|pm))", time_value, re.IGNORECASE)
	if not match:
		raise ValueError(f"Unable to parse time from: {time_value}")
	time_str = match.group(1).replace(" ", "").lower()
	return datetime.strptime(time_str, "%I:%M%p")


def build_event_items(accordion_data: list[dict]) -> list[dict]:
	items: list[dict] = []
	for day in accordion_data:
		month, day_number = parse_day_title(day.get("title", ""))
		for event in day.get("events", []):
			if "time" not in event:
				raise ValueError(f"Event missing time: {event.get('title', 'unknown')}")
			time_only = parse_start_time(event["time"])
			event_time = datetime(YEAR, month, day_number, time_only.hour, time_only.minute)
			item: dict = {
				"title": event["title"],
				"time": event_time,
			}
			for key in [
				"sponsor",
				"speakers",
				"link",
				"description",
				"location",
				"cancelled",
				"slides",
			]:
				if key in event and event[key] is not None:
					if key == "speakers":
						speakers = []
						for speaker in event[key]:
							speaker = dict(speaker)
							speaker["headshot"] = HEADSHOT_URL_TEMPLATE.format(
								id=HEADSHOT_RANDOM.randint(HEADSHOT_MIN, HEADSHOT_MAX)
							)
							speakers.append(speaker)
						item[key] = speakers
						continue
					item[key] = event[key]
			items.append(item)
	return items


def write_output(items: list[dict]) -> None:
	lines: list[str] = [
		"from datetime import datetime",
		"",
		"EVENT_ITEMS_2025 = [",
	]
	for item in items:
		lines.append("    {")
		lines.append(f"        'title': {pprint.pformat(item['title'])},")
		if "sponsor" in item:
			lines.append(f"        'sponsor': {pprint.pformat(item['sponsor'])},")
		lines.append(
			"        'time': datetime({year}, {month}, {day}, {hour}, {minute}),".format(
				year=item["time"].year,
				month=item["time"].month,
				day=item["time"].day,
				hour=item["time"].hour,
				minute=item["time"].minute,
			)
		)
		for key in ["speakers", "link", "description", "location", "cancelled", "slides"]:
			if key in item:
				lines.append(f"        '{key}': {pprint.pformat(item[key])},")
		lines.append("    },")
	lines.append("]")
	OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
	accordion_data = load_accordion_data()
	items = build_event_items(accordion_data)
	write_output(items)
	print(f"Wrote {len(items)} event items to {OUTPUT_PATH}")


if __name__ == "__main__":
	main()
