import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { contact } from '../../content/brand.js';
import { ROUTES } from '../../content/routes.js';
import { footer, nav } from '../../content/siteContent.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Logo } from '../icons/Logo.jsx';
import { MapPinIcon, PhoneIcon } from '../icons/featureIcons.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet.jsx';

const DROPDOWN_CONFIG = {
  product: {
    label: nav.product,
    wide: true,
    groups: [footer.columns[0], footer.columns[1]],
  },
  channels: {
    label: nav.channels,
    wide: false,
    groups: [footer.columns[2]],
  },
  resources: {
    label: nav.resources,
    wide: false,
    groups: [footer.columns[3]],
  },
};

const DROPDOWN_KEYS = ['product', 'channels', 'resources'];

function ChevronDown() {
  return (
    <svg viewBox="0 0 10 10" fill="none" className="nav-chevron" aria-hidden="true">
      <path
        d="M2 3.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(user) {
  const source = (user?.full_name || user?.email || 'CK').trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function DropdownPanel({ config, pathname, onClose, triggerRef }) {
  const panelRef = useRef(null);
  const [shiftX, setShiftX] = useState(0);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.marginLeft = '0px';
    const rect = panel.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || window.innerWidth;
    let delta = 0;
    if (rect.left < 12) delta = 12 - rect.left;
    else if (rect.right > vw - 12) delta = vw - 12 - rect.right;
    setShiftX(delta);
  }, [config]);

  const handleKeyDown = (e) => {
    const links = panelRef.current ? Array.from(panelRef.current.querySelectorAll('a')) : [];
    const idx = links.indexOf(document.activeElement);

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = links[(idx + 1) % Math.max(1, links.length)];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = links[(idx - 1 + links.length) % Math.max(1, links.length)];
      prev?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      links[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      links[links.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={panelRef}
      role="menu"
      className={`ck-glass nav-dropdown ${config.wide ? 'nav-dropdown--wide' : ''}`}
      style={shiftX ? { marginLeft: `${shiftX}px` } : undefined}
      onKeyDown={handleKeyDown}
    >
      {config.groups.length > 1 ? (
        <div className="nav-dropdown-groups">
          {config.groups.map((group) => (
            <div key={group.heading}>
              <div className="nav-dropdown-heading">{group.heading}</div>
              <ul className="nav-dropdown-list">
                {group.links.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      role="menuitem"
                      className="nav-dropdown-link"
                      aria-current={pathname === item.to ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="nav-dropdown-list">
          {config.groups[0].links.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                role="menuitem"
                className="nav-dropdown-link"
                aria-current={pathname === item.to ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [openKey, setOpenKey] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const closeTimerRef = useRef(0);
  const triggerRefs = useRef({});

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = 0;
    }
  };

  const closeDropdown = useCallback(() => {
    clearCloseTimer();
    setOpenKey(null);
  }, []);

  useEffect(() => {
    closeDropdown();
    setDrawerOpen(false);
  }, [pathname, closeDropdown]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!openKey) return undefined;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        const currentKey = openKey;
        closeDropdown();
        triggerRefs.current[currentKey]?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openKey, closeDropdown]);

  const canHover = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleMouseEnter = (key) => {
    if (!canHover()) return;
    clearCloseTimer();
    setOpenKey(key);
  };

  const handleMouseLeave = () => {
    if (!canHover()) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenKey(null);
    }, 120);
  };

  const handleTriggerKeyDown = (key, e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      clearCloseTimer();
      setOpenKey(key);
      window.requestAnimationFrame(() => {
        const wrap = triggerRefs.current[key]?.parentElement;
        const firstLink = wrap?.querySelector('.nav-dropdown a');
        firstLink?.focus();
      });
    } else if (e.key === 'Escape' && openKey === key) {
      e.preventDefault();
      closeDropdown();
    }
  };

  const handleWrapBlur = (key, e) => {
    const wrap = e.currentTarget;
    if (openKey === key && !wrap.contains(e.relatedTarget)) {
      closeDropdown();
    }
  };

  return (
    <header className="site-nav" data-in="">
      <Link
        to={ROUTES.home}
        className="nav-logo"
        aria-current={pathname === ROUTES.home ? 'page' : undefined}
      >
        <Logo />
      </Link>

      <nav ref={menuRef} className="nav-menu" aria-label={nav.label}>
        {DROPDOWN_KEYS.map((key) => {
          const config = DROPDOWN_CONFIG[key];
          const isOpen = openKey === key;
          return (
            <div
              key={key}
              className="nav-item-wrap"
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
              onBlur={(e) => handleWrapBlur(key, e)}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[key] = el;
                }}
                type="button"
                className="nav-item"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => {
                  clearCloseTimer();
                  setOpenKey((prev) => (prev === key ? null : key));
                }}
                onKeyDown={(e) => handleTriggerKeyDown(key, e)}
              >
                <span>{config.label}</span>
                <ChevronDown />
              </button>
              {isOpen && (
                <DropdownPanel
                  config={config}
                  pathname={pathname}
                  onClose={closeDropdown}
                  triggerRef={{ current: triggerRefs.current[key] }}
                />
              )}
            </div>
          );
        })}

        <Link
          to={ROUTES.stories}
          className="nav-item"
          aria-current={pathname === ROUTES.stories ? 'page' : undefined}
        >
          {nav.stories}
        </Link>
      </nav>

      <div className="nav-right">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="nav-avatar" aria-label={nav.account}>
                {getInitials(user)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.full_name || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logout.mutate()}>
                {nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to={ROUTES.login}
            className="nav-login"
            aria-current={pathname === ROUTES.login ? 'page' : undefined}
          >
            {nav.login}
          </Link>
        )}

        <Link to={ROUTES.bookACall} className="nav-pill nav-pill--glass">
          {nav.bookCall}
        </Link>
        <Link to={ROUTES.getStarted} className="nav-pill nav-pill--dark">
          {nav.getStarted}
        </Link>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="nav-burger"
              aria-label={nav.openMenu}
              aria-expanded={drawerOpen}
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
          </SheetTrigger>
          <SheetContent aria-describedby={undefined}>
            <SheetTitle className="sr-only">{nav.label}</SheetTitle>
            <div className="drawer-top">
              <Link to={ROUTES.home} className="nav-logo" onClick={() => setDrawerOpen(false)}>
                <Logo />
              </Link>
              <SheetClose asChild>
                <button type="button" className="drawer-close" aria-label={nav.closeMenu}>
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
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
                        onClick={() => setDrawerOpen(false)}
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
                onClick={() => setDrawerOpen(false)}
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
                    logout.mutate();
                    setDrawerOpen(false);
                  }}
                >
                  {nav.logout}
                </button>
              ) : (
                <Link
                  to={ROUTES.login}
                  className="drawer-btn nav-pill--glass"
                  onClick={() => setDrawerOpen(false)}
                >
                  {nav.login}
                </Link>
              )}
              <Link
                to={ROUTES.bookACall}
                className="drawer-btn ck-btn--ghost"
                onClick={() => setDrawerOpen(false)}
              >
                {nav.bookCall}
              </Link>
              <Link
                to={ROUTES.getStarted}
                className="drawer-btn ck-btn--fill"
                onClick={() => setDrawerOpen(false)}
              >
                {nav.getStarted}
              </Link>
            </div>

            <div className="drawer-contact">
              <a
                href={contact.mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-contact-item"
              >
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
      </div>
    </header>
  );
}
