import { uses } from '../../content/homeContent.js';
import { useReveal } from '../../hooks/useReveal.js';
import { FeatureIcon } from '../icons/featureIcons.jsx';
import { ActionLink } from '../ui/ActionLink.jsx';
import { RichText } from '../ui/RichText.jsx';

const ROLE_ICONS = ['briefcase', 'megaphone', 'document', 'code'];

function RoleCard({ card, index, delay }) {
  const [ref, revealed] = useReveal();

  return (
    <article
      ref={ref}
      className={`ck-glass role-card role-card--${index} reveal ${revealed ? 'in' : ''}`}
      style={{ transitionDelay: revealed ? `${delay}s` : '0s' }}
    >
      <div className="role-card-top">
        <span className="role-card-tag">{uses.tag}</span>
        <FeatureIcon name={ROLE_ICONS[index]} />
      </div>
      <h3 className="role-card-title">{card.title}</h3>
      <p className="role-card-body">{card.body}</p>
      <div className="role-card-chips">
        {card.chips.map((chip) => (
          <span key={chip} className="ck-chip">
            {chip}
          </span>
        ))}
      </div>
      <div className="role-card-foot">
        <ActionLink to={card.to}>{uses.linkLabel}</ActionLink>
      </div>
    </article>
  );
}

export function UsesSection() {
  const [headRef, headIn] = useReveal();
  const [ledeRef, ledeIn] = useReveal();

  return (
    <section id="uses" className="uses-section anchor-section">
      <div className="uses-head">
        <h2 ref={headRef} className={`uses-headline reveal ${headIn ? 'in' : ''}`}>
          <RichText parts={uses.headline} />
        </h2>
        <p ref={ledeRef} className={`ck-lede uses-lede reveal ${ledeIn ? 'in' : ''}`}>
          {uses.lede}
        </p>
      </div>

      <div className="uses-staircase">
        {uses.cards.map((card, idx) => (
          <RoleCard key={card.title} card={card} index={idx} delay={idx * 0.06} />
        ))}
      </div>
    </section>
  );
}
