import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteNav } from './components/layout/SiteNav.jsx';
import { SceneLayout } from './components/scene/SceneLayout.jsx';
import { TooltipProvider } from './components/ui/tooltip.jsx';
import { ROUTES } from './content/routes.js';
import { common } from './content/siteContent.js';
import { useOverflowWatch } from './hooks/useOverflowWatch.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { useViewportUnit } from './hooks/useViewportUnit.js';
import { measureAnchors } from './lib/measureAnchors.js';
import { BookCallPage } from './pages/BookCallPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { ContentPage } from './pages/ContentPage.jsx';
import { DocsPage } from './pages/DocsPage.jsx';
import { GetStartedPage } from './pages/GetStartedPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LegalPage } from './pages/LegalPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { OptOutPage } from './pages/OptOutPage.jsx';
import { PartnersPage } from './pages/PartnersPage.jsx';
import { StatusPage } from './pages/StatusPage.jsx';
import { StoriesPage } from './pages/StoriesPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);
  const reducedMotion = useReducedMotion();
  useViewportUnit();
  useOverflowWatch(pathname);

  const isHome = pathname === ROUTES.home;

  useEffect(() => {
    if (!isHome) {
      document.documentElement.classList.remove('anim');
    }

    if (hash) {
      const targetId = hash.slice(1);
      window.requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
        measureAnchors();
      });
    } else {
      window.scrollTo(0, 0);
      window.requestAnimationFrame(() => {
        measureAnchors();
      });
    }

    if (mainRef.current && pathname !== ROUTES.home) {
      mainRef.current.focus({ preventScroll: true });
    }
  }, [pathname, hash, isHome, reducedMotion]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      measureAnchors();
    });
    observer.observe(main);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onLoad = () => measureAnchors();
    window.addEventListener('load', onLoad, { passive: true });
    window.addEventListener('resize', onLoad, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onLoad).catch(() => {});
    }
    return () => {
      window.removeEventListener('load', onLoad);
      window.removeEventListener('resize', onLoad);
    };
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        {common.skipLink}
      </a>
      <SceneLayout mode={isHome ? 'home' : 'inner'} reducedMotion={reducedMotion} />
      <SiteNav />
      <main id="main" ref={mainRef} className="site-main" tabIndex={-1}>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage reducedMotion={reducedMotion} />} />
          <Route path={ROUTES.productCuration} element={<ContentPage />} />
          <Route path={ROUTES.productMonetization} element={<ContentPage />} />
          <Route path={ROUTES.productForecasts} element={<ContentPage />} />
          <Route path={ROUTES.useCaseMediaAgency} element={<ContentPage />} />
          <Route path={ROUTES.useCaseDirectAdvertiser} element={<ContentPage />} />
          <Route path={ROUTES.useCasePublisher} element={<ContentPage />} />
          <Route path={ROUTES.useCaseAdTech} element={<ContentPage />} />
          <Route path={ROUTES.channelCtv} element={<ContentPage />} />
          <Route path={ROUTES.channelDisplayNative} element={<ContentPage />} />
          <Route path={ROUTES.channelDooh} element={<ContentPage />} />
          <Route path={ROUTES.channelVideoAudio} element={<ContentPage />} />
          <Route path={ROUTES.docs} element={<DocsPage reducedMotion={reducedMotion} />} />
          <Route path={ROUTES.privacy} element={<LegalPage />} />
          <Route path={ROUTES.terms} element={<LegalPage />} />
          <Route path={ROUTES.partners} element={<PartnersPage />} />
          <Route path={ROUTES.status} element={<StatusPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.stories} element={<StoriesPage />} />
          <Route path={ROUTES.bookACall} element={<BookCallPage />} />
          <Route path={ROUTES.getStarted} element={<GetStartedPage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.optOut} element={<OptOutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={180}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
