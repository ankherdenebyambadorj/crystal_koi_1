import { Link } from 'react-router-dom';
import { uiContent } from '../../content/uiContent.js';

export function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="ck-breadcrumb" aria-label={uiContent.breadcrumbLabel}>
      <ol className="ck-breadcrumb-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.label} className="ck-breadcrumb-item">
              {idx > 0 && (
                <span className="ck-breadcrumb-sep" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.to ? (
                <span className="ck-breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="ck-breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
