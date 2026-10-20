import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import './styles/index.css';
import { AppToaster } from './components/ui/feedback';
import { queryClient } from './lib/queryClient';
import { MotionProvider } from './motion';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppSplash } from './routes/fallbacks';
import { router } from './routes/router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionProvider>
          <AuthProvider>
            <Suspense fallback={<AppSplash />}>
              <RouterProvider router={router} />
            </Suspense>
            <AppToaster />
          </AuthProvider>
        </MotionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
