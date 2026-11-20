import { Link, useLocation } from 'react-router-dom';
import { StepsStrip } from '../components/home/StepsStrip.jsx';
import { FeatureIcon } from '../components/icons/featureIcons.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import { ActionLink } from '../components/ui/ActionLink.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { brand } from '../content/brand.js';
import { packs } from '../content/homeContent.js';
import { contentPages, pageCommon } from '../content/pagesContent.js';
import { ROUTES } from '../content/routes.js';
import { footer, nav, pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';

function getRelatedLinks(pathname) {
  const segment = pathname.split('/')[1];
  const allLinks = footer.columns.flatMap((col) => col.links);
  return allLinks.filter((item) => {
    const itemSeg = item.to.split('/')[1];
    return itemSeg === segment && item.to !== pathname;
  });
}

function FeatureCard({ feature, index, delay }) {
  const [ref, revealed] = useReveal();

  return (
    <article
      ref={ref}
      className={`ck-glass page-feature-card reveal ${revealed ? 'in' : ''}`}
      style={{ transitionDelay: revealed ? `${delay}s` : '0s' }}
    >
      <div className="page-feature-top">
        <span className="pack-card-index">{String(index + 1).padStart(2, '0')}</span>
        <FeatureIcon name={feature.icon} />
      </div>
      <h2 className="page-feature-title">{feature.title}</h2>
      <p className="page-feature-body">{feature.body}</p>
    </article>
  );
}

export function ContentPage() {
  const { pathname } = useLocation();
  const data = contentPages[pathname];
  const pageTitle = pageTitles[pathname] || brand.name;

  usePageMeta({
    title: `${pageTitle} — ${brand.name}`,
    description: data?.lede,
  });

  const [headerRef, headerIn] = useReveal();
  const [stepsLabelRef, stepsLabelIn] = useReveal();
  const [relatedRef, relatedIn] = useReveal();

  if (!data) return null;

  const related = getRelatedLinks(pathname);

  return (
    <PageShell>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <span className="ck-chip page-eyebrow">{data.eyebrow}</span>
        <h1 className="page-title">
          <RichText parts={data.title} />
        </h1>
        <p className="ck-lede page-lede">{data.lede}</p>
        <div className="page-actions">
          <Link to={ROUTES.getStarted} className="ck-btn ck-btn--fill">
            {nav.getStarted}
          </Link>
          <Link to={ROUTES.bookACall} className="ck-btn ck-btn--ghost">
            {nav.bookCall}
          </Link>
        </div>
      </header>

      <div className="page-features-grid">
        {data.features.map((feature, idx) => (
          <FeatureCard key={feature.title} feature={feature} index={idx} delay={idx * 0.08} />
        ))}
      </div>

      <div>
        <div ref={stepsLabelRef} className={`page-section-label reveal ${stepsLabelIn ? 'in' : ''}`}>
          {pageCommon.howItWorks}
        </div>
        <StepsStrip steps={packs.steps} />
      </div>

      {related.length > 0 && (
        <div ref={relatedRef} className={`page-related reveal ${relatedIn ? 'in' : ''}`}>
          <div className="page-section-label">{pageCommon.alsoSee}</div>
          <div className="page-related-links">
            {related.map((item) => (
              <ActionLink key={item.to} to={item.to}>
                {item.label}
              </ActionLink>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
