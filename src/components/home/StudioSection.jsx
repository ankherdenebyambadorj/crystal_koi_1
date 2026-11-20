import { Link } from 'react-router-dom';
import { studio } from '../../content/homeContent.js';
import { ROUTES } from '../../content/routes.js';
import { useReveal } from '../../hooks/useReveal.js';
import { RichText } from '../ui/RichText.jsx';
import { ProductDashboard } from './dashboard/ProductDashboard.jsx';

export function StudioSection({ reducedMotion }) {
  const [headRef, headIn] = useReveal();
  const [ledeRef, ledeIn] = useReveal();
  const [btnsRef, btnsIn] = useReveal();
  const [statsRef, statsIn] = useReveal();

  return (
    <section id="studio" className="studio-section anchor-section">
      <h2 ref={headRef} className={`studio-headline reveal ${headIn ? 'in' : ''}`}>
        <RichText parts={studio.headline} />
      </h2>
      <p ref={ledeRef} className={`ck-lede studio-lede reveal ${ledeIn ? 'in' : ''}`}>
        {studio.lede}
      </p>
      <div ref={btnsRef} className={`studio-buttons reveal ${btnsIn ? 'in' : ''}`}>
        <Link to={ROUTES.getStarted} className="ck-btn ck-btn--fill">
          {studio.primaryCta}
        </Link>
        <Link to={ROUTES.bookACall} className="ck-btn ck-btn--ghost">
          {studio.secondaryCta}
        </Link>
      </div>

      <div ref={statsRef} className={`studio-stats reveal ${statsIn ? 'in' : ''}`}>
        {studio.stats.map((stat) => (
          <div key={stat.value} className="studio-stat">
            <div className="studio-stat-val">{stat.value}</div>
            <div className="studio-stat-cap">
              {stat.caption[0]}
              <br />
              {stat.caption[1]}
            </div>
          </div>
        ))}
      </div>

      <ProductDashboard reducedMotion={reducedMotion} />
    </section>
  );
}
