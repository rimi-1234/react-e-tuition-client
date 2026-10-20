import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Home, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button, Logo } from '../../components/ui';
import NotFound from './NotFound';

/** Error boundary for route trees: 404s get the friendly page, crashes get a recovery screen. */
export default function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  // A new deploy can invalidate lazy chunk names; a reload fetches the fresh build.
  const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed/i.test(error?.message || '');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <TriangleAlert className="size-7" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold">{isChunkError ? 'A new version is available' : 'Something went wrong'}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          {isChunkError ? 'Edurock was updated while you were browsing. Reload to get the latest version.' : 'An unexpected error stopped this page from loading. Reloading usually fixes it.'}
        </p>
        {import.meta.env.DEV && error?.message && <pre className="mx-auto mt-4 max-w-xl overflow-x-auto rounded-xl bg-soft p-3 text-left text-xs">{error.message}</pre>}
      </div>
      <div className="flex gap-3">
        <Button leftIcon={RefreshCw} onClick={() => window.location.reload()}>
          Reload
        </Button>
        <Button variant="outline" leftIcon={Home} href="/">
          Home
        </Button>
      </div>
    </main>
  );
}
