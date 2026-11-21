import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell.jsx';
import { Button } from '../components/ui/button.jsx';
import { brand } from '../content/brand.js';
import { ROUTES } from '../content/routes.js';
import { common } from '../content/siteContent.js';
import { uiContent } from '../content/uiContent.js';
import { useNoIndex } from '../hooks/useNoIndex.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export function NotFoundPage() {
  useNoIndex();
  usePageMeta({
    title: `${common.notFoundTitle} — ${brand.name}`,
    description: uiContent.notFoundBody,
  });

  return (
    <PageShell showBreadcrumb={false}>
      <section className="not-found-wrap">
        <div className="page-eyebrow">{uiContent.notFoundEyebrow}</div>
        <h1 className="page-title">{uiContent.notFoundTitle}</h1>
        <p className="ck-lede page-lede">{uiContent.notFoundBody}</p>
        <div className="page-actions">
          <Button asChild variant="dark">
            <Link to={ROUTES.home}>{uiContent.notFoundPrimary}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to={ROUTES.contact}>{uiContent.notFoundSecondary}</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
