import { ArrowLeft, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { Enter, Marquee, Reveal } from '../../motion';
import { PHOTOS } from '../../utils/images';
import { Avatar, Button, Logo } from '../ui';

const QUOTES = [
  ['“Found an HSC Physics tutor in two days. My son finally enjoys the subject.”', 'Nabila A., parent · Dhaka'],
  ['“I get serious students and I’m paid on time. Simple as that.”', 'Tanvir H., tutor · Uttara'],
  ['“The reviews made choosing so much easier.”', 'Shafin R., student · Chattogram'],
];

/** Goes back within the app when possible, otherwise to the home page. */
function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  // React Router marks the first entry of a session with key "default".
  const canGoBack = location.key !== 'default';
  return (
    <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}>
      Back
    </Button>
  );
}

/**
 * Sign in / sign up shell. The page scrolls normally (window scrollbar);
 * on desktop the artwork is fixed to the right half and blends into the
 * page background on its left edge.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh">
      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:w-1/2">
        <div className="flex items-center justify-between">
          <Logo />
          <BackButton />
        </div>
        <main id="main" className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <Enter>
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </Enter>
        </main>
        {footer && <div className="text-center text-sm text-muted">{footer}</div>}
      </div>

      <aside className="fixed inset-y-0 right-0 hidden w-1/2 overflow-hidden bg-base-200 lg:block" aria-hidden>
        <img
          src={PHOTOS.hero.src}
          srcSet={PHOTOS.hero.srcSet}
          sizes="50vw"
          alt=""
          onError={(e) => {
            e.currentTarget.removeAttribute('srcset');
            e.currentTarget.src = '/images/students-collab.jpg';
          }}
          className="absolute inset-0 size-full object-cover opacity-90"
        />
        {/* Left edge melts into the page colour (works in light and dark mode) */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-base-200 via-base-200/70 to-transparent" />
        {/* Readability scrim under the copy, masked so it never darkens the blended edge */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0b1020]/90 via-[#0b1020]/45 via-45% to-transparent [mask-image:linear-gradient(to_right,transparent_15%,black_55%)]" />

        <div className="relative flex h-full flex-col justify-end gap-8 py-14 pl-[30%] pr-12 text-white xl:pr-16">
          <Reveal>
            <p className="max-w-md font-display text-4xl leading-tight drop-shadow-sm xl:text-5xl">
              The right teacher turns <span className="text-gradient">“I can’t”</span> into “I get it”.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['1573496359142-b8d87734a5a2', '1560250097-0b93528c311a', '1594744803329-e58b31de8bf5'].map((p) => (
                <Avatar key={p} src={`https://images.unsplash.com/photo-${p}?auto=format&fit=crop&w=80&h=80&q=60`} name="Tutor" size="sm" />
              ))}
            </div>
            <div className="text-sm">
              <p className="flex items-center gap-1 font-semibold">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-3.5 fill-accent text-accent" />
                ))}
              </p>
              <p className="text-white/75">Loved by families across Bangladesh</p>
            </div>
          </Reveal>
          <Marquee speed={50}>
            {QUOTES.map(([q, who]) => (
              <figure key={who} className="w-72 shrink-0 rounded-2xl border border-white/10 bg-[#0b1020]/45 p-5">
                <blockquote className="whitespace-normal text-sm leading-relaxed">{q}</blockquote>
                <figcaption className="mt-3 text-xs text-white/60">{who}</figcaption>
              </figure>
            ))}
          </Marquee>
        </div>
      </aside>
    </div>
  );
}
