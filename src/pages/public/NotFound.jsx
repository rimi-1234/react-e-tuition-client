import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Magnetic, TextReveal } from '../../motion';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();
  return (
    <section className="relative flex min-h-[80dvh] items-center overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-1/3 size-[30rem] -translate-x-1/2 glow-primary" />
      </div>
      <div className="container-page text-center">
        <p className="select-none font-display text-[clamp(7rem,24vw,16rem)] font-semibold leading-none tracking-tighter text-base-content/[0.07]" aria-hidden>
          404
        </p>
        <TextReveal as="h1" trigger="mount" text="This page took a study break." highlight={['break.']} className="-mt-10 text-3xl font-semibold sm:-mt-16 sm:text-5xl" />
        <p className="mx-auto mt-4 max-w-md text-muted">The link may be broken, or the page may have moved. Let’s get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" leftIcon={ArrowLeft} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Magnetic>
            <Button to="/tuitions" leftIcon={Search}>
              Browse tuitions
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
