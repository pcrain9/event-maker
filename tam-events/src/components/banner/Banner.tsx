import type { BannerProps } from "../../types";

export default function Banner({ heroImageUrl }: BannerProps) {
  return (
    <header className="layout__hero">
      {heroImageUrl ? (
        <div className="layout__hero-frame">
          <div
            className="layout__hero-media"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
            aria-hidden="true"
          />
        </div>
      ) : null}
    </header>
  );
}
