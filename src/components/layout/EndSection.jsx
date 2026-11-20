import { CtaPanel } from './CtaPanel.jsx';
import { SiteFooter } from './SiteFooter.jsx';

export function EndSection({ isInner = false, showCta = true, statusSlot }) {
  return (
    <section
      id="end"
      className={`end-section anchor-section ${isInner ? 'end-section--inner' : ''}`}
    >
      {showCta && <CtaPanel />}
      <SiteFooter statusSlot={statusSlot} />
    </section>
  );
}
