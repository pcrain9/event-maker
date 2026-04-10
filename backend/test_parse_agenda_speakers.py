from pathlib import Path

from backend.scripts.parse_agenda_speakers import build_event_items_from_agenda


def test_build_event_items_from_agenda_handles_parallel_sessions_and_speakers(tmp_path: Path) -> None:
    csv_path = tmp_path / "agenda.csv"
    csv_path.write_text(
        "\n".join(
            [
                ",Start Time,End Time,Event,Session Title,Location,Session Description,Speaker Name,Speaker Institution,Speaker Headshot,Sponsored By",
                ',"Monday, April 20, 2026",,,,,,,,,',
                ',9:45 AM,10:45 AM,Concurrent Sessions,Collaborating with Texas Tribes,Meeting Room 101 AB,Practical training,Kate Betz,Story + Reason,TRUE,',
                ',,,,,,,Evan Windham,Story + Reason,TRUE,',
                ',,,,Funding Loss: Facing the Challenges with Creative Alternatives,Meeting Room 102 A,Funding panel,Taylor Ernst,LHUCA,TRUE,Sponsored by Example Org',
                ',12:15 PM,1:00 PM,Keynote,Serving the Whole Community,Exhibit Hall A,"Museums exist because of their communities","Adam Rozan, Director of Audience Research",,TRUE,Sponsored by Visit McAllen',
                ',,,Self Guided Tour,Tour the Region,,Explore on your own,,,,',
            ]
        ),
        encoding="utf-8",
    )

    items, warnings = build_event_items_from_agenda(csv_path, "https://cdn.example.com/")

    assert len(items) == 4

    first = items[0]
    assert first["title"] == "Collaborating with Texas Tribes"
    assert first["time"] == "2026-04-20T09:45:00"
    assert first["location"] == "Meeting Room 101 AB"
    assert [speaker["name"] for speaker in first["speakers"]] == ["Kate Betz", "Evan Windham"]
    assert first["speakers"][0]["headshot"] == "https://cdn.example.com/headshots/kate%betz.jpg"

    second = items[1]
    assert second["title"] == "Funding Loss: Facing the Challenges with Creative Alternatives"
    assert second["time"] == "2026-04-20T09:45:00"
    assert second["sponsor"] == "Sponsored by Example Org"

    third = items[2]
    assert third["title"] == "Serving the Whole Community"
    assert third["speakers"][0]["name"] == "Adam Rozan"
    assert third["speakers"][0]["institution"] == "Director of Audience Research"

    fourth = items[3]
    assert fourth["title"] == "Tour the Region"
    assert fourth["time"] == "2026-04-20T00:00:00"
    assert fourth["speakers"] is None
    assert any("missing a start time" in warning for warning in warnings)