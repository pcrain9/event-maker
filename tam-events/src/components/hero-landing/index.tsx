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
  return (
    <section className="hero-landing">
      {cornerAction ? (
        <div className="hero-landing__corner-action">{cornerAction}</div>
      ) : null}
      <div className="hero-landing__content">
        <h1 className="hero-landing__title">Welcome to TAM</h1>
        <p className="hero-landing__subtitle">Texas Association of Museums</p>
      </div>
    </section>
  );
};

export default HeroLanding;
