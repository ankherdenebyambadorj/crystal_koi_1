import { useLocation } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell.jsx';
import { brand } from '../content/brand.js';
import { legalContent, pageCommon } from '../content/pagesContent.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';

export function LegalPage() {
  const { pathname } = useLocation();
  const data = legalContent[pathname];
  const pageTitle = pageTitles[pathname] || data?.title || brand.name;

  usePageMeta({
    title: `${pageTitle} — ${brand.name}`,
    description: data?.sections?.[0]?.paragraphs?.[0],
  });

  const [headerRef, headerIn] = useReveal();

  if (!data) return null;

  return (
    <PageShell>
      <div className="legal-wrap">
        <header ref={headerRef} className={`reveal ${headerIn ? 'in' : ''}`}>
          <h1 className="page-title">{data.title}</h1>
          <p className="legal-updated">
            {pageCommon.lastUpdated}: {data.updated}
          </p>
        </header>

        {data.sections.map((section, idx) => (
          <section key={section.heading} className="legal-section">
            <h2 className="legal-heading">
              {idx + 1}. {section.heading}
            </h2>
            {section.paragraphs.map((p, pIdx) => (
              <p key={pIdx} className="legal-para">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
