import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../content/routes.js';
import { hero } from '../../content/siteContent.js';
import { useHeroEntrance } from '../../hooks/useHeroEntrance.js';

export function HeroSection({ reducedMotion }) {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const sublineRef = useRef(null);
  const buttonsRef = useRef(null);
  const scrollCardRef = useRef(null);

  const refs = useMemo(
    () => ({
      line1: line1Ref,
      line2: line2Ref,
      subline: sublineRef,
      buttons: buttonsRef,
      scrollCard: scrollCardRef,
    }),
    [],
  );

  useHeroEntrance(refs, reducedMotion);

  const handleScrollDown = () => {
    const target = document.getElementById('studio');
    const behavior = reducedMotion ? 'auto' : 'smooth';
    if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior });
    }
  };

  return (
    <section id="hero" className="hero">
      <h1 className="hero-headline">
        <span className="hero-line-mask">
          <span ref={line1Ref} className="hero-line-span" data-in="">
            {hero.headline[0]}
          </span>
        </span>
        {hero.headline[1] && (
          <span className="hero-line-mask">
            <span ref={line2Ref} className="hero-line-span" data-in="">
              {hero.headline[1]}
            </span>
          </span>
        )}
      </h1>

      <p ref={sublineRef} className="hero-subline" data-in="">
        {hero.subline}
      </p>

      <div ref={buttonsRef} className="hero-buttons" data-in="">
        <Link to={ROUTES.getStarted} className="ck-btn ck-btn--fill">
          {hero.primaryCta}
        </Link>
        <Link to={ROUTES.bookACall} className="ck-btn ck-btn--ghost">
          {hero.secondaryCta}
        </Link>
      </div>

      <button
        ref={scrollCardRef}
        type="button"
        className="scroll-card"
        onClick={handleScrollDown}
        aria-label={hero.scrollLabel}
        data-in=""
      >
        <span>
          {hero.scrollCard[0]}
          <br />
          {hero.scrollCard[1]}
        </span>
        <svg viewBox="0 0 22 22" fill="none" className="scroll-card-arrow" aria-hidden="true">
          <path
            d="M11 3v15M5 12l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
