/**
 * Landing Page Route
 * Displays hero section and grid of all available events
 */

import { useEffect, useState } from "react";
import { useToast } from "../../components/toast";
import HeroLanding from "../../components/hero-landing";
import EventGrid from "../../components/event-grid";
import { getEvents } from "../../api";
import type { EventIdsResponse } from "../../types";
import "./landing.scss";

const LandingRoute = () => {
  const [events, setEvents] = useState<EventIdsResponse["events"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const data = await getEvents();
        setEvents(data.events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setHasError(true);
        toast.error("Failed to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="landing-page">
      <HeroLanding />

      {hasError ? (
        <section className="landing-page__error">
          <div className="landing-page__error-content">
            <h2>Unable to Load Events</h2>
            <p>
              We encountered an error while loading events. Please refresh the
              page and try again.
            </p>
          </div>
        </section>
      ) : (
        <EventGrid events={events} isLoading={isLoading} />
      )}
    </div>
  );
};

export default LandingRoute;
