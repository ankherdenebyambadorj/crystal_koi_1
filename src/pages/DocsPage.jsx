import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell.jsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { brand } from '../content/brand.js';
import { docsContent } from '../content/pagesContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';

export function DocsPage({ reducedMotion }) {
  const title = pageTitles[ROUTES.docs] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: docsContent.lede,
  });

  const [activeId, setActiveId] = useState(docsContent.nav[0].id);
  const [headerRef, headerIn] = useReveal();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const sections = docsContent.nav
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleJump = (id, e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <PageShell>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <h1 className="page-title">
          <RichText parts={docsContent.title} />
        </h1>
        <p className="ck-lede page-lede">{docsContent.lede}</p>
      </header>

      <div className="docs-layout">
        <nav className="docs-nav" aria-label={title}>
          {docsContent.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`docs-nav-link ${activeId === item.id ? 'is-active' : ''}`}
              aria-current={activeId === item.id ? 'true' : undefined}
              onClick={(e) => handleJump(item.id, e)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="docs-articles">
          <article id="start" className="docs-article">
            <h2 className="docs-article-title">{docsContent.start.heading}</h2>
            <ol className="docs-steps">
              {docsContent.start.steps.map((step, idx) => (
                <li key={step.lead} className="ck-glass docs-step">
                  <span className="docs-step-num">{String(idx + 1).padStart(2, '0')}</span>
                  <p className="docs-step-text">
                    <strong className="docs-step-lead">{step.lead}</strong>
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </article>

          <article id="glossary" className="docs-article">
            <h2 className="docs-article-title">{docsContent.glossary.heading}</h2>
            <dl className="docs-glossary">
              {docsContent.glossary.items.map((entry) => (
                <div key={entry.term} className="docs-glossary-row">
                  <dt className="docs-glossary-term">{entry.term}</dt>
                  <dd className="docs-glossary-def">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article id="faq" className="docs-article">
            <h2 className="docs-article-title">{docsContent.faq.heading}</h2>
            <Accordion type="single" collapsible className="docs-faq-list">
              {docsContent.faq.items.map((item, idx) => (
                <AccordionItem key={item.q} value={`faq-${idx}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>
                    <span>{item.a}</span>
                    {item.link && (
                      <Link to={item.link.to} className="ck-accordion-link">
                        {item.link.label}
                      </Link>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </article>
        </div>
      </div>
    </PageShell>
  );
}
