import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function NavDropdownPanel({ config, pathname, onClose, triggerRef }) {
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
      links[(idx + 1) % Math.max(1, links.length)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      links[(idx - 1 + links.length) % Math.max(1, links.length)]?.focus();
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
