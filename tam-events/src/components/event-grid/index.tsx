/**
 * Event Grid Component
 * Displays multiple event cards in a responsive grid layout
 */

import EventCard, { type EventCardProps } from "../event-card";
import "./event-grid.scss";

export interface EventGridProps {
  events: EventCardProps[];
  isLoading?: boolean;
}

/**
 * Skeleton loader card for loading state
 */
const EventCardSkeleton = () => (
  <div className="event-card event-card--skeleton">
    <div className="event-card__image-container">
      <div className="event-card__image-placeholder skeleton" />
    </div>
    <div className="event-card__content">
      <div className="event-card__title skeleton skeleton--title" />
      <div className="event-card__cta skeleton" />
    </div>
  </div>
);

export const EventGrid = ({ events, isLoading = false }: EventGridProps) => {
  // Loading state: show 3 skeleton cards
  if (isLoading) {
    return (
      <section className="event-grid">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </section>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <section className="event-grid event-grid--empty">
        <div className="event-grid__empty-state">
          <p>No events scheduled at this time.</p>
        </div>
      </section>
    );
  }

  // Render event cards
  return (
    <section className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </section>
  );
};

export default EventGrid;
