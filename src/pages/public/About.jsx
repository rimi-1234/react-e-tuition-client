import { ArrowRight, BadgeCheck, HeartHandshake, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import { HowItWorks, StatsBand } from '../../components/home/Sections';
import { Button, Card, SectionHeading } from '../../components/ui';
import { Faq } from '../../components/ui/Faq';
import { PageHero } from '../../components/ui/PageHero';
import { PHOTOS } from '../../utils/images';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Parallax, Reveal, Stagger } from '../../motion';

const VALUES = [
  { icon: ShieldCheck, title: 'Trust first', text: 'Moderated posts, reviewed tutors and ratings only from real hires.' },
  { icon: HeartHandshake, title: 'Fair for both sides', text: 'Free for families, a transparent 10% fee for tutors. No hidden costs.' },
  { icon: Lightbulb, title: 'Learning that sticks', text: 'We match on subject, level and teaching style, not just price.' },
  { icon: Target, title: 'Built for Bangladesh', text: 'Bangla & English medium, SSC/HSC, O/A Levels and admission prep.' },
];

export default function About() {
  useDocumentTitle('About us');

  return (
    <>
      <PageHero
        photo={PHOTOS.hero}
        eyebrow="About Edurock"
        title={'Every student deserves\na teacher who gets them.'}
        highlight={['gets', 'them.']}
        description="We started Edurock in Dhaka to make finding a great tutor as easy as it should be: transparent, safe and fair for families and tutors."
      />

      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2">
        <Parallax speed={0.1}>
          <div className="grid grid-cols-2 gap-4">
            <img src="/images/lecture.jpg" alt="A tutor teaching" loading="lazy" className="aspect-[3/4] w-full rounded-3xl object-cover" />
            <img src="/images/study-notes.jpg" alt="Study notes on a desk" loading="lazy" className="mt-12 aspect-[3/4] w-full rounded-3xl object-cover" />
          </div>
        </Parallax>
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Our story"
            title="From word-of-mouth to a marketplace families trust"
            description="Finding a tutor used to mean asking around, guessing at rates and hoping for the best. Edurock brings it into one place: real requests, reviewed tutors, honest reviews and secure payments."
          />
          <ul className="mt-8 space-y-3">
            {['Moderated tuition posts', 'Reviewed and verified tutor profiles', 'Secure, card-based payments with Stripe'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <BadgeCheck className="size-5 text-primary" /> {t}
              </li>
            ))}
          </ul>
          <Button to="/tuitions" className="mt-8" rightIcon={ArrowRight}>
            Explore tuitions
          </Button>
        </Reveal>
      </section>

      <StatsBand />

      <section id="safety" className="container-page py-16">
        <Reveal>
          <SectionHeading eyebrow="What we value" title="Principles we build on" />
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {VALUES.map((v) => (
            <Card key={v.title} interactive>
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <v.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-sans text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
            </Card>
          ))}
        </Stagger>
      </section>

      <HowItWorks />

      <section id="faq" className="container-page grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHeading align="left" eyebrow="FAQ" title="Questions, answered" description="Can’t find what you need? Our team replies within a business day.">
            <Button to="/contact" variant="outline" className="mt-6">
              Contact support
            </Button>
          </SectionHeading>
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
      </section>
    </>
  );
}
