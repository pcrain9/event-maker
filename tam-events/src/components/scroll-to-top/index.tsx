import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 320;

const getScrollBehavior = (): ScrollBehavior => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "auto";
  }

  return "smooth";
};

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      className="layout__scroll-top"
      type="button"
      aria-label="Scroll back to top"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: getScrollBehavior() });
      }}
    >
      <span className="layout__scroll-top-icon" aria-hidden="true">
        ↑
      </span>
    </button>
  );
}
