import { Link } from 'react-router-dom';
import { brand, contact, social } from '../../content/brand.js';
import { ROUTES } from '../../content/routes.js';
import { footer } from '../../content/siteContent.js';
import { useServiceStatus } from '../../hooks/useServiceStatus.js';
import { FacebookIcon } from '../icons/FacebookIcon.jsx';
import { InstagramIcon } from '../icons/InstagramIcon.jsx';
import { Logo } from '../icons/Logo.jsx';
import { MapPinIcon, PhoneIcon } from '../icons/featureIcons.jsx';
import { Separator } from '../ui/separator.jsx';

function LiveStatusBadge() {
  const { data, isLoading, isError } = useServiceStatus();
  const components = data?.components || [];
  if (isLoading || isError || components.length === 0) return null;

  const hasOutage = components.some((c) => c.state === 'outage');
  const hasDegraded = components.some((c) => c.state === 'degraded');
  const toneClass = hasOutage
    ? 'ck-chip--danger'
    : hasDegraded
      ? 'ck-chip--warn'
      : 'ck-chip--live';
  const label = hasOutage || hasDegraded ? footer.systemStatusDegraded : footer.systemStatus;

  return (
    <div className="footer-status-wrap">
      <Link to={ROUTES.status} className={`ck-chip ${toneClass}`}>
        <span className="ck-live-dot" />
        <span>{label}</span>
      </Link>
    </div>
  );
}

export function SiteFooter({ statusSlot }) {
  const year = new Date().getFullYear();
  const hasSocial = Boolean(social.facebook || social.instagram);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link to={ROUTES.home} className="footer-brand-logo">
            <Logo markClassName="footer-logo-mark" />
          </Link>
          <p className="footer-about">{footer.about}</p>

          {statusSlot !== undefined ? statusSlot : <LiveStatusBadge />}

          <div className="footer-contact">
            <div className="footer-col-heading">{footer.contactHeading}</div>
            <div className="footer-contact-list">
              <a
                href={contact.mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <MapPinIcon className="footer-contact-icon" />
                <span>{contact.address}</span>
              </a>
              <a href={contact.phoneHref} className="footer-contact-link">
                <PhoneIcon className="footer-contact-icon" />
                <span>{contact.phoneDisplay}</span>
              </a>
            </div>
            {hasSocial && (
              <div className="footer-social">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={footer.facebookLabel}
                    className="footer-social-btn"
                  >
                    <FacebookIcon className="footer-social-icon" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={footer.instagramLabel}
                    className="footer-social-btn"
                  >
                    <InstagramIcon className="footer-social-icon" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {footer.columns.map((col) => (
          <div key={col.heading}>
            <div className="footer-col-heading">{col.heading}</div>
            <ul className="footer-links">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Separator />

      <div className="footer-legal">
        <span>
          ©{year} {brand.name}: {brand.descriptor}
        </span>
        <div className="footer-legal-links">
          {footer.legalLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="footer-wordmark" aria-hidden="true">
        {brand.name}
      </div>
    </footer>
  );
}
