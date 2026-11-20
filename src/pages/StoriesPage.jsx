import { PageShell } from '../components/layout/PageShell.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { brand } from '../content/brand.js';
import { storiesCopy } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { useStories } from '../hooks/useStories.js';

export function StoriesPage() {
  const title = pageTitles[ROUTES.stories] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: storiesCopy.lede,
  });

  const [headerRef, headerIn] = useReveal();
  const { data, isLoading, isError, refetch } = useStories();
  const items = data?.items || [];

  return (
    <PageShell>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{storiesCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={storiesCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{storiesCopy.lede}</p>
      </header>

      {isLoading ? (
        <div className="data-grid-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="ck-glass data-card">
              <Skeleton className="sk-badge" />
              <Skeleton className="sk-title" />
              <Skeleton className="sk-body" />
              <Skeleton className="sk-body-short" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert variant="error" className="data-alert">
          <div className="data-alert-row">
            <span>{storiesCopy.loadError}</span>
            <Button variant="ghost" onClick={() => refetch()}>
              {storiesCopy.retry}
            </Button>
          </div>
        </Alert>
      ) : items.length === 0 ? (
        <div className="ck-glass data-empty">{storiesCopy.empty}</div>
      ) : (
        <div className="data-grid-3">
          {items.map((story) => (
            <article key={story.id} className="ck-glass data-card">
              <div className="data-card-meta">
                <Badge variant="neutral">{story.industry}</Badge>
                <span className="data-card-kicker">{story.customer_name}</span>
              </div>
              <h2 className="data-card-title">{story.headline}</h2>
              <p className="data-card-body">{story.summary}</p>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
