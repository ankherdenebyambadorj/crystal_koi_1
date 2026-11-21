import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { loginCopy } from '../../content/formsContent.js';
import { ROUTES } from '../../content/routes.js';
import { footer, nav } from '../../content/siteContent.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Logo } from '../icons/Logo.jsx';
import { Avatar, AvatarFallback } from '../ui/avatar.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
import { notifyToast } from '../ui/toast.jsx';
import { MobileNavDrawer } from './MobileNavDrawer.jsx';
import { NavDropdownPanel } from './NavDropdown.jsx';

const DROPDOWN_CONFIG = {
  product: { label: nav.product, wide: true, groups: [footer.columns[0], footer.columns[1]] },
  channels: { label: nav.channels, wide: false, groups: [footer.columns[2]] },
  resources: { label: nav.resources, wide: false, groups: [footer.columns[3]] },
};
const DROPDOWN_KEYS = ['product', 'channels', 'resources'];

function getInitials(user) {
  const source = (user?.full_name || user?.email || 'CK').trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
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

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!openKey) return undefined;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) closeDropdown();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        const key = openKey;
        closeDropdown();
        triggerRefs.current[key]?.focus();
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
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

  const handleTriggerKeyDown = (key, e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      clearCloseTimer();
      setOpenKey(key);
      window.requestAnimationFrame(() => {
        triggerRefs.current[key]?.parentElement?.querySelector('.nav-dropdown a')?.focus();
      });
    } else if (e.key === 'Escape' && openKey === key) {
      e.preventDefault();
      closeDropdown();
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => notifyToast({ title: loginCopy.logoutSuccess }),
    });
  };

  return (
    <header className="site-nav" data-in="">
      <Link to={ROUTES.home} className="nav-logo" aria-current={pathname === ROUTES.home ? 'page' : undefined}>
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
              onMouseEnter={() => {
                if (canHover()) {
                  clearCloseTimer();
                  setOpenKey(key);
                }
              }}
              onMouseLeave={() => {
                if (canHover()) {
                  clearCloseTimer();
                  closeTimerRef.current = window.setTimeout(() => setOpenKey(null), 120);
                }
              }}
              onBlur={(e) => {
                if (openKey === key && !e.currentTarget.contains(e.relatedTarget)) closeDropdown();
              }}
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
                <svg viewBox="0 0 10 10" fill="none" className="nav-chevron" aria-hidden="true">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <NavDropdownPanel
                  config={config}
                  pathname={pathname}
                  onClose={closeDropdown}
                  triggerRef={{ current: triggerRefs.current[key] }}
                />
              )}
            </div>
          );
        })}

        <Link to={ROUTES.stories} className="nav-item" aria-current={pathname === ROUTES.stories ? 'page' : undefined}>
          {nav.stories}
        </Link>
      </nav>

      <div className="nav-right">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label={nav.account}>
                <Avatar className="nav-avatar">
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.full_name || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>{nav.logout}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to={ROUTES.login} className="nav-login" aria-current={pathname === ROUTES.login ? 'page' : undefined}>
            {nav.login}
          </Link>
        )}

        <Link to={ROUTES.bookACall} className="nav-pill nav-pill--glass">{nav.bookCall}</Link>
        <Link to={ROUTES.getStarted} className="nav-pill nav-pill--dark">{nav.getStarted}</Link>

        <MobileNavDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}
