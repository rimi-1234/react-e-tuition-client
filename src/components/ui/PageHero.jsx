import { ParallaxImage, TextReveal } from '../../motion';
import { cn } from '../../utils/cn';

/**
 * Hero at the top of inner public pages. With `photo`, it becomes a banner:
 * a full-bleed parallax image with a left-side fade so the copy stays crisp.
 */
export function PageHero({ eyebrow, title, highlight = [], description, children, className, photo }) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden pb-14 pt-32 sm:pt-36',
        photo && 'flex min-h-[460px] items-end sm:min-h-[520px]',
        className,
      )}
    >
      {photo ? (
        <>
          <ParallaxImage photo={photo} priority speed={0.2} className="absolute inset-0 -z-20" />
          <div className="hero-scrim pointer-events-none absolute inset-0 -z-10" aria-hidden />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-48 left-1/2 size-[36rem] -translate-x-1/2 glow-primary" />
          <div className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_65%)]" />
        </div>
      )}
      <div className="container-page w-full">
        {eyebrow && <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <TextReveal as="h1" trigger="mount" text={title} highlight={highlight} className="max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl" />
        {description && <p className="mt-5 max-w-2xl text-lg text-base-content/75">{description}</p>}
        {children}
      </div>
    </section>
  );
}
