import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../content/routes.js';
import { pageTitles } from '../../content/siteContent.js';
import { uiContent } from '../../content/uiContent.js';
import { Breadcrumb } from '../ui/breadcrumb.jsx';
import { EndSection } from './EndSection.jsx';

function buildBreadcrumbs(pathname) {
  const clean = pathname.replace(/\/+$/, '') || ROUTES.home;
  const pageTitle = pageTitles[clean];
  if (!pageTitle) return [];

  const items = [{ label: uiContent.homeCrumb, to: ROUTES.home }];
  const parts = clean.split('/').filter(Boolean);
  if (parts.length > 1) {
    const sectionLabel = uiContent.sectionNames[parts[0]];
    if (sectionLabel) {
      items.push({ label: sectionLabel });
    }
  }
  items.push({ label: pageTitle });
  return items;
}

export function PageShell({ children, showCta = true, showBreadcrumb = true, statusSlot }) {
  const { pathname } = useLocation();
  const crumbs = showBreadcrumb ? buildBreadcrumbs(pathname) : [];

  return (
    <>
      <div className="page-shell">
        {crumbs.length > 0 && <Breadcrumb items={crumbs} />}
        {children}
      </div>
      <EndSection isInner showCta={showCta} statusSlot={statusSlot} />
    </>
  );
}
