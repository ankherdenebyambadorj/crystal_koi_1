import { useId } from 'react';
import { brand } from '../../content/brand.js';

const customLogos = import.meta.glob('../../assets/logo.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const CUSTOM_LOGO_URL = Object.values(customLogos)[0] || null;

export function Logo({ showWordmark = true, className = '', markClassName = 'nav-logo-mark' }) {
  const rawId = useId();
  const gradId = `ck-logo-${rawId.replace(/:/g, '')}`;

  return (
    <span className={className ? `inline-flex items-center ${className}` : 'inline-flex items-center'}>
      {CUSTOM_LOGO_URL ? (
        <img src={CUSTOM_LOGO_URL} alt="" className={markClassName} aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 40 40" className={markClassName} aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2d6ff" />
              <stop offset="100%" stopColor="#6f78ff" />
            </linearGradient>
          </defs>
          <path
            d="M20 3 L35 20 L20 37 L5 20 Z"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M13 27 C13 19 19 13 28 12 C27 21 21 27 13 27 Z" fill={`url(#${gradId})`} />
        </svg>
      )}
      {showWordmark && <span>{brand.name}</span>}
    </span>
  );
}
