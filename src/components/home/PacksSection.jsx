import { Link } from 'react-router-dom';
import { packs } from '../../content/homeContent.js';
import { ROUTES } from '../../content/routes.js';
import { useReveal } from '../../hooks/useReveal.js';
import { FeatureIcon } from '../icons/featureIcons.jsx';
import { ActionLink } from '../ui/ActionLink.jsx';
import { RichText } from '../ui/RichText.jsx';
import { BidRequestCode } from './BidRequestCode.jsx';
import { StepsStrip } from './StepsStrip.jsx';

const PACK_ICONS = ['crosshair', 'screen', 'trend'];

function PackageCard({ card, index, delay }) {
  const [ref, revealed] = useReveal();
  const isLead = index === 0;

  return (
    <article
      ref={ref}
      className={`ck-glass pack-card ${isLead ? 'pack-card--lead' : ''} reveal ${revealed ? 'in' : ''}`}
      style={{ transitionDelay: revealed ? `${delay}s` : '0s' }}
    >
      <div className="pack-card-top">
        <span className="pack-card-index">{card.index}</span>
        <FeatureIcon name={PACK_ICONS[index]} />
      </div>
      <div className="pack-card-eyebrow">{card.eyebrow}</div>
      <h3 className="pack-card-title">{card.title}</h3>
      <p className="pack-card-body">{card.body}</p>
      <div className="pack-card-meta">
        <div>
          <div className="pack-card-metric-cap">{card.metricLabel}</div>
          <div className="pack-card-metric">{card.metric}</div>
        </div>
        <ActionLink to={card.to}>{card.linkLabel}</ActionLink>
      </div>
    </article>
  );
}

export function PacksSection({ reducedMotion }) {
  const [leftRef, leftIn] = useReveal();

  return (
    <section id="packs" className="packs-section anchor-section">
      <div className="packs-split">
        <div ref={leftRef} className={`reveal ${leftIn ? 'in' : ''}`}>
          <h2 className="packs-headline">
            <RichText parts={packs.headline} />
          </h2>
          <p className="ck-lede packs-lede">{packs.lede}</p>
          <div className="packs-buttons">
            <Link to={ROUTES.stories} className="ck-btn ck-btn--white">
              {packs.primaryCta}
            </Link>
            <Link to={ROUTES.bookACall} className="ck-btn ck-btn--dk">
              {packs.secondaryCta}
            </Link>
          </div>
        </div>

        <BidRequestCode reducedMotion={reducedMotion} />
      </div>

      <div className="packs-grid">
        {packs.cards.map((card, idx) => (
          <PackageCard key={card.index} card={card} index={idx} delay={idx * 0.08} />
        ))}
      </div>

      <StepsStrip steps={packs.steps} />
    </section>
  );
}
