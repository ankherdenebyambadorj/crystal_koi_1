import { contact } from '../../content/brand.js';
import { contactCopy } from '../../content/formsContent.js';
import { MapPinIcon, PhoneIcon } from '../icons/featureIcons.jsx';

export function ContactInfoCard() {
  return (
    <aside className="ck-glass contact-info-card">
      <h2 className="contact-info-title">{contactCopy.directTitle}</h2>
      <div className="contact-info-items">
        <a
          href={contact.mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-info-row"
        >
          <MapPinIcon className="contact-info-icon" />
          <div>
            <div className="contact-info-label">{contactCopy.addressLabel}</div>
            <div className="contact-info-value">{contact.address}</div>
          </div>
        </a>
        <a href={contact.phoneHref} className="contact-info-row">
          <PhoneIcon className="contact-info-icon" />
          <div>
            <div className="contact-info-label">{contactCopy.phoneLabel}</div>
            <div className="contact-info-value">{contact.phoneDisplay}</div>
          </div>
        </a>
      </div>
    </aside>
  );
}
