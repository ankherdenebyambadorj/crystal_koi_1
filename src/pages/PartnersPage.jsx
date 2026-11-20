import { useMemo, useState } from 'react';
import { PageShell } from '../components/layout/PageShell.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip.jsx';
import { brand } from '../content/brand.js';
import { partnersCopy } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { usePartners } from '../hooks/usePartners.js';
import { useReveal } from '../hooks/useReveal.js';

const CATEGORY_KEYS = ['all', 'supply', 'demand', 'measurement', 'data'];

export function PartnersPage() {
  const title = pageTitles[ROUTES.partners] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: partnersCopy.lede,
  });

  const [headerRef, headerIn] = useReveal();
  const [category, setCategory] = useState('all');
  const { data, isLoading, isError, refetch } = usePartners();

  const items = useMemo(() => {
    const raw = data?.items || [];
    if (category === 'all') return raw;
    return raw.filter((item) => item.category === category);
  }, [data, category]);

  return (
    <PageShell>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{partnersCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={partnersCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{partnersCopy.lede}</p>
      </header>

      <Tabs value={category} onValueChange={setCategory} className="partners-tabs">
        <TabsList>
          {CATEGORY_KEYS.map((key) => (
            <TabsTrigger key={key} value={key}>
              {partnersCopy.categories[key]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="data-grid-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="ck-glass data-card">
              <Skeleton className="sk-badge" />
              <Skeleton className="sk-title" />
              <Skeleton className="sk-body" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert variant="error" className="data-alert">
          <div className="data-alert-row">
            <span>{partnersCopy.loadError}</span>
            <Button variant="ghost" onClick={() => refetch()}>
              {partnersCopy.retry}
            </Button>
          </div>
        </Alert>
      ) : items.length === 0 ? (
        <div className="ck-glass data-empty">{partnersCopy.empty}</div>
      ) : (
        <div className="data-grid-3">
          {items.map((partner) => (
            <article key={partner.id} className="ck-glass data-card">
              <div className="data-card-meta">
                <Badge variant="neutral">
                  {partnersCopy.categories[partner.category] || partner.category}
                </Badge>
              </div>
              <h2 className="data-card-title">{partner.name}</h2>
              <p className="data-card-body">{partner.description}</p>
              {partner.website_url && (
                <div className="data-card-foot">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ck-text-link partner-ext-link"
                      >
                        <span>{partnersCopy.visitLabel}</span>
                        <svg viewBox="0 0 16 16" fill="none" className="ck-text-link-arrow" aria-hidden="true">
                          <path
                            d="M4 12L12 4M6 4h6v6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>{partner.website_url}</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
