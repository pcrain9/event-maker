import type { ScheduleProps } from "../../types";

type ScheduleAccordionProps = ScheduleProps & {
  defaultOpen?: boolean;
};

const getSpeakerInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .trim();

export const ScheduleAccordion = ({
  day,
  defaultOpen = false,
}: ScheduleAccordionProps) => {
  const sessionLabel = day.sessions.length === 1 ? "session" : "sessions";

  return (
    <details className="schedule__day schedule__accordion" open={defaultOpen}>
      <summary className="schedule__accordion-summary">
        <div className="schedule__day-header">
          <div>
            <p className="schedule__day-label">{day.label}</p>
            <p className="schedule__day-date">{day.date}</p>
          </div>
          <p className="schedule__day-focus">{day.focus}</p>
        </div>
        <div className="schedule__accordion-meta">
          <span className="schedule__accordion-count">
            {day.sessions.length} {sessionLabel}
          </span>
          <span className="schedule__accordion-actions">
            <span className="schedule__accordion-toggle schedule__accordion-toggle--closed">
              View schedule
            </span>
            <span className="schedule__accordion-toggle schedule__accordion-toggle--open">
              Hide schedule
            </span>
            <span className="schedule__accordion-chevron" aria-hidden="true" />
          </span>
        </div>
      </summary>
      <div className="schedule__sessions">
        {day.sessions.map((session) => {
          const speakers = session.speakers ?? [];
          const speakerNames = speakers
            .map((speaker) => speaker.name)
            .join(", ");
          const hasSpeakers = speakers.length > 0;
          const description = session.description?.trim();
          const trackLabel = session.track?.trim();

          return (
            <div
              key={`${day.label}-${session.id}`}
              className="schedule__card"
              data-status={session.status}
            >
              <div className="schedule__summary">
                {hasSpeakers ? (
                  <div
                    className="schedule__speaker-stack"
                    aria-label="Speakers"
                  >
                    {speakers.map((speaker, index) => {
                      const speakerImage = speaker.headshot?.trim();
                      const speakerInitials = speaker.name
                        ? getSpeakerInitials(speaker.name)
                        : "TBA";

                      return (
                        <div
                          key={`${speaker.name}-${index}`}
                          className="schedule__speaker"
                        >
                          {speakerImage ? (
                            <img
                              className="schedule__speaker-img"
                              src={speakerImage}
                              alt={`Portrait of ${speaker.name}`}
                              loading="lazy"
                            />
                          ) : (
                            <span className="schedule__speaker-fallback">
                              {speakerInitials}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <div>
                  <p className="schedule__time">{session.time}</p>
                  <h3 className="schedule__title">{session.title}</h3>
                  {trackLabel ? (
                    <span className="schedule__track">
                      Sponsored by: {trackLabel}
                    </span>
                  ) : null}
                  {speakerNames.length > 0 ? (
                    <p className="schedule__speakers">{speakerNames}</p>
                  ) : null}
                  <p className="schedule__location">{session.room}</p>
                  {description ? (
                    <p className="schedule__description">{description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
};
