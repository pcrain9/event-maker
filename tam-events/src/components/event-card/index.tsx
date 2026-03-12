/**
 * Event Card Component
 * Displays a single event with title, hero image, date range, and CTA button
 */

import { useNavigate } from "react-router-dom";
import "./event-card.scss";

export interface EventCardProps {
  id: number;
  slug: string;
  title: string;
  hero_image_url?: string | null;
}

export const EventCard = ({ slug, title, hero_image_url }: EventCardProps) => {
  const navigate = useNavigate();

  const handleViewSchedule = () => {
    navigate(`/${slug}`);
  };

  return (
    <div className="event-card">
      <div className="event-card__image-container">
        {hero_image_url ? (
          <img src={hero_image_url} alt={title} className="event-card__image" />
        ) : (
          <div className="event-card__image-placeholder" />
        )}
      </div>

      <div className="event-card__content">
        <h2 className="event-card__title">{title}</h2>

        <button onClick={handleViewSchedule} className="event-card__cta">
          View Schedule
        </button>
      </div>
    </div>
  );
};

export default EventCard;
