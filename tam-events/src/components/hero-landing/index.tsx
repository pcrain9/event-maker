/**
 * Landing Page Hero Section
 * Displays "Welcome to TAM" with professional styling
 */

import "./hero-landing.scss";

export const HeroLanding = () => {
  return (
    <section className="hero-landing">
      <div className="hero-landing__content">
        <h1 className="hero-landing__title">Welcome to TAM</h1>
        <p className="hero-landing__subtitle">Texas Association of Museums</p>
      </div>
    </section>
  );
};

export default HeroLanding;
