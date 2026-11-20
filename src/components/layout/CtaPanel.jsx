import { Link } from 'react-router-dom';
import { cta } from '../../content/homeContent.js';
import { ROUTES } from '../../content/routes.js';
import { useReveal } from '../../hooks/useReveal.js';
import { RichText } from '../ui/RichText.jsx';

export function CtaPanel() {
  const [ref, revealed] = useReveal();

  return (
    <div ref={ref} className={`ck-glass cta-panel reveal ${revealed ? 'in' : ''}`}>
      <h2 className="cta-headline">
        <RichText parts={cta.headline} />
      </h2>
      <p className="ck-lede cta-lede">{cta.lede}</p>
      <div className="cta-buttons">
        <Link to={ROUTES.getStarted} className="ck-btn ck-btn--fill">
          {cta.primaryCta}
        </Link>
        <Link to={ROUTES.bookACall} className="ck-btn ck-btn--ghost">
          {cta.secondaryCta}
        </Link>
      </div>
      <p className="cta-note">{cta.note}</p>
    </div>
  );
}
