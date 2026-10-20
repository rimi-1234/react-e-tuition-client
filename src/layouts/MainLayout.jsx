import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import { FloatingActions } from '../components/layout/FloatingActions';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { Enter, ScrollProgressBar } from '../motion';
import { PageFallback } from '../routes/fallbacks';

export default function MainLayout() {
  const { pathname } = useLocation();
  useScrollRestoration();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[100] rounded-xl bg-primary px-4 py-2 text-primary-content focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <ScrollProgressBar />
      <Navbar />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          {/* Keyed so each route plays a soft entrance. */}
          <Enter key={pathname}>
            <Outlet />
          </Enter>
        </Suspense>
      </main>
      <Footer showCta={pathname !== '/'} />
      <FloatingActions />
    </div>
  );
}
