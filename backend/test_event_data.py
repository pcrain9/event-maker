from datetime import datetime

# Three-day test event schedule with ten items per day.
TEST_EVENT_ITEMS = [
    {
        "title": "Registration and Badge Pickup",
        "time": datetime(2026, 6, 10, 8, 0),
        "location": "Main Lobby",
        "description": "Check in, pick up badges, and collect event materials.",
    },
    {
        "title": "Welcome Breakfast",
        "time": datetime(2026, 6, 10, 8, 30),
        "location": "Grand Ballroom",
        "description": "Networking breakfast for all attendees.",
    },
    {
        "title": "Opening Keynote",
        "time": datetime(2026, 6, 10, 9, 30),
        "location": "Grand Ballroom",
        "description": "Kickoff session introducing goals and event themes.",
    },
    {
        "title": "Platform Roadmap Session",
        "time": datetime(2026, 6, 10, 10, 30),
        "location": "Room A101",
        "description": "Overview of upcoming platform features and milestones.",
    },
    {
        "title": "Break",
        "time": datetime(2026, 6, 10, 11, 15),
        "location": "Expo Hall",
    },
    {
        "title": "Workshop: Building Fast APIs",
        "time": datetime(2026, 6, 10, 11, 30),
        "location": "Room B204",
        "description": "Hands-on workshop focused on API performance patterns.",
    },
    {
        "title": "Lunch",
        "time": datetime(2026, 6, 10, 12, 30),
        "location": "Dining Hall",
    },
    {
        "title": "Panel: Scaling Teams",
        "time": datetime(2026, 6, 10, 14, 0),
        "location": "Grand Ballroom",
        "description": "Leaders discuss operating models for growing teams.",
    },
    {
        "title": "Lightning Talks",
        "time": datetime(2026, 6, 10, 15, 30),
        "location": "Room C110",
        "description": "Short talks showcasing community projects.",
    },
    {
        "title": "Evening Reception",
        "time": datetime(2026, 6, 10, 17, 0),
        "location": "Rooftop Terrace",
        "description": "Informal networking reception.",
    },
    {
        "title": "Morning Coffee",
        "time": datetime(2026, 6, 11, 8, 0),
        "location": "Main Lobby",
    },
    {
        "title": "Day 2 Kickoff",
        "time": datetime(2026, 6, 11, 8, 45),
        "location": "Grand Ballroom",
        "description": "Highlights and agenda for day two.",
    },
    {
        "title": "Session: Data Modeling Best Practices",
        "time": datetime(2026, 6, 11, 9, 30),
        "location": "Room A101",
        "description": "Practical strategies for maintainable schemas.",
    },
    {
        "title": "Session: Frontend Architecture",
        "time": datetime(2026, 6, 11, 10, 30),
        "location": "Room B204",
        "description": "Patterns for scalable component systems.",
    },
    {
        "title": "Break",
        "time": datetime(2026, 6, 11, 11, 15),
        "location": "Expo Hall",
    },
    {
        "title": "Workshop: Testing in Production",
        "time": datetime(2026, 6, 11, 11, 30),
        "location": "Room C110",
        "description": "Risk-aware practices for validating systems at scale.",
    },
    {
        "title": "Lunch",
        "time": datetime(2026, 6, 11, 12, 30),
        "location": "Dining Hall",
    },
    {
        "title": "Roundtable: DevEx Improvements",
        "time": datetime(2026, 6, 11, 14, 0),
        "location": "Room A101",
        "description": "Collaborative discussion on developer workflow upgrades.",
    },
    {
        "title": "Case Study Presentations",
        "time": datetime(2026, 6, 11, 15, 30),
        "location": "Grand Ballroom",
        "description": "Real-world implementation stories from participants.",
    },
    {
        "title": "Community Meetup",
        "time": datetime(2026, 6, 11, 17, 0),
        "location": "Courtyard",
        "description": "Open meetup for special interest groups.",
    },
    {
        "title": "Breakfast and Networking",
        "time": datetime(2026, 6, 12, 8, 0),
        "location": "Dining Hall",
    },
    {
        "title": "Day 3 Kickoff",
        "time": datetime(2026, 6, 12, 8, 45),
        "location": "Grand Ballroom",
    },
    {
        "title": "Session: Security by Design",
        "time": datetime(2026, 6, 12, 9, 30),
        "location": "Room B204",
        "description": "Techniques for building safer systems from day one.",
    },
    {
        "title": "Session: Observability Deep Dive",
        "time": datetime(2026, 6, 12, 10, 30),
        "location": "Room C110",
        "description": "Metrics, traces, and logs for fast issue resolution.",
    },
    {
        "title": "Break",
        "time": datetime(2026, 6, 12, 11, 15),
        "location": "Expo Hall",
    },
    {
        "title": "Workshop: Incident Response Drills",
        "time": datetime(2026, 6, 12, 11, 30),
        "location": "Room A101",
        "description": "Guided incident simulations and response playbooks.",
    },
    {
        "title": "Lunch",
        "time": datetime(2026, 6, 12, 12, 30),
        "location": "Dining Hall",
    },
    {
        "title": "Closing Panel",
        "time": datetime(2026, 6, 12, 14, 0),
        "location": "Grand Ballroom",
        "description": "Panel recap and major takeaways from the event.",
    },
    {
        "title": "Closing Remarks",
        "time": datetime(2026, 6, 12, 15, 30),
        "location": "Grand Ballroom",
    },
    {
        "title": "Farewell Mixer",
        "time": datetime(2026, 6, 12, 16, 30),
        "location": "Rooftop Terrace",
        "description": "Final networking session before departure.",
    },
]
