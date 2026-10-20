import { useForm } from 'react-hook-form';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { PageHero } from '../../components/ui/PageHero';
import { PHOTOS } from '../../utils/images';
import { useSendContact } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Reveal, Stagger } from '../../motion';
import { useAuth } from '../../providers/AuthProvider';

const CHANNELS = [
  { icon: Mail, label: 'Email', value: 'hello@edurock.app', href: 'mailto:hello@edurock.app' },
  { icon: Phone, label: 'Phone', value: '+880 1700-000000', href: 'tel:+8801700000000' },
  { icon: MapPin, label: 'Office', value: 'House 12, Road 5, Dhanmondi, Dhaka' },
  { icon: Clock, label: 'Hours', value: 'Sat–Thu, 10am – 7pm' },
];

export default function Contact() {
  useDocumentTitle('Contact');
  const { user } = useAuth();
  const send = useSendContact();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitSuccessful },
  } = useForm({ defaultValues: { name: user?.displayName || '', email: user?.email || '', subject: '', message: '', website: '' } });

  const onSubmit = (values) =>
    send.mutateAsync(values).then(
      () => reset({ ...values, subject: '', message: '' }),
      (err) => Object.entries(err.fieldErrors || {}).forEach(([f, m]) => setError(f, { message: m })),
    );

  return (
    <>
      <PageHero photo={PHOTOS.focus} eyebrow="Contact" title={'We’d love to\nhear from you.'} highlight={['hear']} description="Questions about a tuition, payments or your account? Send us a message." />

      <section className="container-page grid gap-8 pb-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Stagger className="space-y-3" stagger={0.07}>
          {CHANNELS.map((c) => {
            const content = (
              <>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs text-subtle">{c.label}</span>
                  <span className="block font-medium">{c.value}</span>
                </span>
              </>
            );
            return c.href ? (
              <a key={c.label} href={c.href} className="flex items-center gap-4 rounded-2xl border border-soft bg-base-100 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30">
                {content}
              </a>
            ) : (
              <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-soft bg-base-100 p-4">
                {content}
              </div>
            );
          })}
          <div className="rounded-2xl bg-neutral p-6 text-neutral-content">
            <MessageCircle className="size-6 text-accent" />
            <p className="mt-3 font-display text-xl">Average reply time: under 4 hours</p>
            <p className="mt-1 text-sm opacity-70">During business hours, a real person reads every message.</p>
          </div>
        </Stagger>

        <Reveal>
          <Card className="sm:p-8">
            <h2 className="text-2xl font-semibold">Send a message</h2>
            {isSubmitSuccessful && !send.isError && (
              <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm text-success" role="status">
                Thanks! Your message is in. We’ll reply to your email soon.
              </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Your name" required autoComplete="name" error={errors.name?.message} {...register('name', { required: 'Please enter your name', minLength: { value: 2, message: 'Too short' } })} />
                <Input
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email', { required: 'Please enter your email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                />
              </div>
              <Input label="Subject" placeholder="What is this about?" error={errors.subject?.message} {...register('subject', { maxLength: 120 })} />
              <Textarea
                label="Message"
                required
                rows={6}
                error={errors.message?.message}
                {...register('message', { required: 'Please write a message', minLength: { value: 10, message: 'A little more detail, please (10+ characters)' } })}
              />
              {/* Honeypot: hidden from people, irresistible to bots */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" {...register('website')} />
              <Button type="submit" size="lg" loading={send.isPending} rightIcon={Send} className="w-full sm:w-auto">
                Send message
              </Button>
            </form>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
