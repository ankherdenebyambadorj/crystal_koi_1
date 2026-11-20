import { Link } from 'react-router-dom';

export function ActionLink({ to, children, className = '' }) {
  return (
    <Link to={to} className={`ck-text-link ${className}`.trim()}>
      <span>{children}</span>
      <svg viewBox="0 0 16 16" fill="none" className="ck-text-link-arrow" aria-hidden="true">
        <path
          d="M2 8h11M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
