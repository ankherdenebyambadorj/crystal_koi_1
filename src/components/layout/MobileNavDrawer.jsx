import { Link } from 'react-router-dom';
import { contact } from '../../content/brand.js';
import { ROUTES } from '../../content/routes.js';
import { footer, nav } from '../../content/siteContent.js';
import { Logo } from '../icons/Logo.jsx';
import { MapPinIcon, PhoneIcon } from '../icons/featureIcons.jsx';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet.jsx';

export function MobileNavDrawer({ open, onOpenChange, pathname, user, onLogout }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="nav-burger"
          aria-label={nav.openMenu}
          aria-expanded={open}
        >
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="sr-only">{nav.label}</SheetTitle>
        <div className="drawer-top">
          <Link to={ROUTES.home} className="nav-logo" onClick={() => onOpenChange(false)}>
            <Logo />
          </Link>
          <SheetClose asChild>
            <button type="button" className="drawer-close" aria-label={nav.closeMenu}>
              <svg
                viewBox="0 0 20 20"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </SheetClose>
        </div>

        <div className="drawer-sections">
          {footer.columns.map((group) => (
            <div key={group.heading}>
              <div className="drawer-group-title">{group.heading}</div>
              <div>
                {group.links.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="drawer-link"
                    aria-current={pathname === item.to ? 'page' : undefined}
                    onClick={() => onOpenChange(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Link
            to={ROUTES.stories}
            className="drawer-link"
            aria-current={pathname === ROUTES.stories ? 'page' : undefined}
            onClick={() => onOpenChange(false)}
          >
            {nav.stories}
          </Link>
        </div>

        <div className="drawer-actions">
          {user ? (
            <button
              type="button"
              className="drawer-btn nav-pill--glass"
              onClick={() => {
                onLogout();
                onOpenChange(false);
              }}
            >
              {nav.logout}
            </button>
          ) : (
            <Link to={ROUTES.login} className="drawer-btn nav-pill--glass" onClick={() => onOpenChange(false)}>
              {nav.login}
            </Link>
          )}
          <Link to={ROUTES.bookACall} className="drawer-btn ck-btn--ghost" onClick={() => onOpenChange(false)}>
            {nav.bookCall}
          </Link>
          <Link to={ROUTES.getStarted} className="drawer-btn ck-btn--fill" onClick={() => onOpenChange(false)}>
            {nav.getStarted}
          </Link>
        </div>

        <div className="drawer-contact">
          <a href={contact.mapHref} target="_blank" rel="noopener noreferrer" className="drawer-contact-item">
            <MapPinIcon className="footer-contact-icon" />
            <span>{contact.address}</span>
          </a>
          <a href={contact.phoneHref} className="drawer-contact-item">
            <PhoneIcon className="footer-contact-icon" />
            <span>{contact.phoneDisplay}</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
