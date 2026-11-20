import { HeroSection } from '../components/home/HeroSection.jsx';
import { PacksSection } from '../components/home/PacksSection.jsx';
import { StudioSection } from '../components/home/StudioSection.jsx';
import { UsesSection } from '../components/home/UsesSection.jsx';
import { EndSection } from '../components/layout/EndSection.jsx';
import { meta } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export function HomePage({ reducedMotion }) {
  usePageMeta({
    title: meta.siteTitle,
    description: meta.description,
  });

  return (
    <>
      <HeroSection reducedMotion={reducedMotion} />
      <StudioSection reducedMotion={reducedMotion} />
      <PacksSection reducedMotion={reducedMotion} />
      <UsesSection />
      <EndSection />
    </>
  );
}
