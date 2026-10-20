import { Link } from 'react-router';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Reveal } from '../../motion';
import { Button, Logo } from '../ui';
import { FOOTER_LINKS } from './navigation';

const SOCIAL = [
  { icon: FaFacebookF, label: 'Facebook', href: 'https://facebook.com' },
  { icon: FaXTwitter, label: 'X', href: 'https://x.com' },
  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: 'https://linkedin.com' },
];

export function Footer({ showCta = true }) {
  return (
    <footer className="cv-auto relative mt-24 overflow-hidden border-t border-soft bg-base-100">
      <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 max-w-3xl glow-primary" aria-hidden />

      <div className="container-page relative">
        {/* CTA band */}
        {showCta && (
        <Reveal className="flex flex-col items-start justify-between gap-6 border-b border-soft py-14 md:flex-row md:items-center">
          <div>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              Great teaching changes everything. <span className="text-gradient">Start today.</span>
            </h2>
            <p className="mt-3 text-muted">Posting a tuition is free. Verified tutors usually respond within a day.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/dashboard/post-tuition" size="lg">
              Post a tuition
            </Button>
            <Button to="/tutors" size="lg" variant="outline" rightIcon={ArrowUpRight}>
              Browse tutors
            </Button>
          </div>
        </Reveal>
        )}

        <div className="grid gap-12 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Edurock connects families with verified tutors across Bangladesh, from Class 1 to university admission.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 text-primary" /> House 12, Road 5, Dhanmondi, Dhaka
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-primary" /> hello@edurock.app
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-primary" /> +880 1700-000000
              </li>
            </ul>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="font-sans text-sm font-semibold">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-soft py-6 sm:flex-row">
          <p className="text-xs text-subtle">© {new Date().getFullYear()} Edurock. Made with care in Dhaka.</p>
          <div className="flex gap-1">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-xl text-base-content/60 transition-all hover:-translate-y-0.5 hover:bg-soft hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="pointer-events-none select-none overflow-hidden" aria-hidden>
        <p className="translate-y-[18%] text-center font-display text-[22vw] font-semibold leading-none tracking-tighter text-base-content/[0.035]">
          Edurock
        </p>
      </div>
    </footer>
  );
}
