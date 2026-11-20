import { PageShell } from '../components/layout/PageShell.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip.jsx';
import { brand } from '../content/brand.js';
import { statusCopy } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { useServiceStatus } from '../hooks/useServiceStatus.js';

function getOverallSummary(components) {
  if (!components || components.length === 0) return null;
  if (components.some((c) => c.state === 'outage')) {
    return { label: statusCopy.overallOutage, variant: 'danger' };
  }
  if (components.some((c) => c.state === 'degraded')) {
    return { label: statusCopy.overallDegraded, variant: 'warn' };
  }
  return { label: statusCopy.overallOperational, variant: 'live' };
}

function stateBadgeVariant(state) {
  if (state === 'operational') return 'live';
  if (state === 'degraded') return 'warn';
  if (state === 'outage') return 'danger';
  return 'neutral';
}

function severityBadgeVariant(severity) {
  if (severity === 'critical') return 'danger';
  if (severity === 'major') return 'warn';
  return 'neutral';
}

export function StatusPage() {
  const title = pageTitles[ROUTES.status] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: statusCopy.lede,
  });

  const [headerRef, headerIn] = useReveal();
  const { data, isLoading, isError, refetch } = useServiceStatus();

  const components = data?.components || [];
  const incidents = data?.incidents || [];
  const overall = getOverallSummary(components);

  return (
    <PageShell>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{statusCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={statusCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{statusCopy.lede}</p>
      </header>

      {isLoading ? (
        <div className="status-stack">
          <Skeleton className="sk-banner" />
          <Skeleton className="sk-row" />
          <Skeleton className="sk-row" />
        </div>
      ) : isError ? (
        <Alert variant="error" className="data-alert">
          <div className="data-alert-row">
            <span>{statusCopy.loadError}</span>
            <Button variant="ghost" onClick={() => refetch()}>
              {statusCopy.retry}
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="status-stack">
          {overall && (
            <div className="ck-glass status-banner">
              <Badge variant={overall.variant}>{overall.label}</Badge>
            </div>
          )}

          {components.length === 0 ? (
            <div className="ck-glass data-empty">{statusCopy.emptyComponents}</div>
          ) : (
            <div className="status-list">
              {components.map((comp) => (
                <div key={comp.id} className="ck-glass status-row">
                  <div className="status-row-main">
                    <h2 className="status-comp-name">{comp.component_name}</h2>
                    {comp.note && <p className="status-comp-note">{comp.note}</p>}
                  </div>
                  <div className="status-row-meta">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="status-updated-btn">
                          <Badge variant={stateBadgeVariant(comp.state)}>
                            {statusCopy.componentStates[comp.state] || comp.state}
                          </Badge>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{comp.updated_at}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}

          <section className="status-incidents">
            <h2 className="page-section-label">{statusCopy.incidentsHeading}</h2>
            {incidents.length === 0 ? (
              <div className="ck-glass data-empty">{statusCopy.emptyIncidents}</div>
            ) : (
              <div className="status-list">
                {incidents.map((inc) => (
                  <article key={inc.id} className="ck-glass status-incident-card">
                    <div className="data-card-meta">
                      <Badge variant={severityBadgeVariant(inc.severity)}>
                        {statusCopy.incidentSeverities[inc.severity] || inc.severity}
                      </Badge>
                      <Badge variant="neutral">
                        {statusCopy.incidentStates[inc.state] || inc.state}
                      </Badge>
                      <span className="status-incident-date">{inc.occurred_at.slice(0, 10)}</span>
                    </div>
                    <h3 className="status-comp-name">{inc.title}</h3>
                    <p className="data-card-body">{inc.summary}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}
