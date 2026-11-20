import { useEffect } from 'react';
import { meta } from '../content/siteContent.js';

export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const resolvedTitle = title || meta.siteTitle;
    const resolvedDescription = description || meta.description;
    document.title = resolvedTitle;

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', resolvedDescription);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', resolvedTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', resolvedDescription);
  }, [title, description]);
}
