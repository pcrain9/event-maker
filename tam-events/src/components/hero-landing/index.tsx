/**
 * Landing Page Hero Section
 * Displays "Welcome to TAM" with professional styling
 */

import type { ReactNode } from "react";
import "./hero-landing.scss";

type HeroLandingProps = {
  cornerAction?: ReactNode;
};

export const HeroLanding = ({ cornerAction }: HeroLandingProps) => {
  const CLOUDFLARE_BASE_URL = import.meta.env.VITE_CLOUDFLARE_BASE_URL?.trim();

  return (
    <section className="hero-landing">
      {cornerAction ? (
        <div className="hero-landing__corner-action">{cornerAction}</div>
      ) : null}
      <div className="hero-landing__content">
        <img
          src={`${CLOUDFLARE_BASE_URL}logos/tam%20logo.png`}
          alt="TAM Events"
          className="hero-landing__logo"
        />
        <h1 className="hero-landing__title">events</h1>
      </div>
    </section>
  );
};

export default HeroLanding;
