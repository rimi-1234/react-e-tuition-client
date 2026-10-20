import { useNavigate, useParams } from 'react-router';
import { AlertTriangle, ArrowLeft, Clock, Info, Lock } from 'lucide-react';
import TuitionForm from '../../../components/tuition/TuitionForm';
import { Button, DetailSkeleton, EmptyState, ErrorState, LoadingRegion, PageHeader, StatusBadge } from '../../../components/ui';
import { useTuition, useUpdateTuition } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Reveal } from '../../../motion';
import { cn } from '../../../utils/cn';

const CALLOUT_TONE = {
  warning: 'border-warning/25 bg-warning/8 text-warning',
  error: 'border-error/20 bg-error/8 text-error',
  info: 'border-info/20 bg-info/8 text-info',
};

function Callout({ tone = 'info', icon: Icon, title, children }) {
  return (
    <div className={cn('mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5', CALLOUT_TONE[tone])} role="note">
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-0.5 text-base-content/75">{children}</p>}
      </div>
    </div>
  );
}

/** What happens when this post is saved, based on its current status. */
function StatusCallout({ tuition }) {
  if (tuition.status === 'Approved') {
    return (
      <Callout tone="warning" icon={AlertTriangle} title="This post is live">
        Saving your changes sends it back for a quick review. It will be hidden from tutors until it’s approved again.
      </Callout>
    );
  }
  if (tuition.status === 'Rejected') {
    return (
      <Callout tone="error" icon={Info} title="Changes were requested">
        {tuition.rejectionReason || 'Update the post and save it to resubmit for review.'}
      </Callout>
    );
  }
  return (
    <Callout tone="info" icon={Clock} title="In review">
      You can keep editing while our team reviews this post.
    </Callout>
  );
}

export default function EditTuition() {
  useDocumentTitle('Edit tuition');
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tuition, isPending, error, refetch } = useTuition(id);
  const update = useUpdateTuition();

  const onSubmit = async (payload) => {
    await update.mutateAsync({ id, ...payload });
    navigate('/dashboard/my-posts');
  };

  const back = (
    <Button variant="ghost" leftIcon={ArrowLeft} to="/dashboard/my-posts">
      My tuitions
    </Button>
  );

  return (
    <>
      <PageHeader
        eyebrow="Edit post"
        title={tuition?.title || 'Edit tuition'}
        description={tuition ? <span className="inline-flex items-center gap-2">Status <StatusBadge status={tuition.status} labels={{ Pending: 'In review' }} /></span> : 'Update the details of your tuition post.'}
        actions={back}
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <LoadingRegion label="Loading tuition">
          <DetailSkeleton />
        </LoadingRegion>
      ) : tuition.status === 'Booked' ? (
        <EmptyState
          icon={Lock}
          title="This tuition is already booked"
          description="You’ve hired a tutor for this post, so its details are locked. Post a new tuition if you need help with something else."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" to="/dashboard/my-posts">
                Back to my tuitions
              </Button>
              <Button to="/dashboard/post-tuition">Post a new tuition</Button>
            </div>
          }
        />
      ) : (
        <Reveal variant="fade" duration={0.5}>
          <StatusCallout tuition={tuition} />
          <TuitionForm
            key={tuition.id}
            defaultValues={tuition}
            onSubmit={onSubmit}
            submitLabel={tuition.status === 'Approved' ? 'Save & resubmit' : 'Save changes'}
            submitting={update.isPending}
          />
        </Reveal>
      )}
    </>
  );
}
