import { useNavigate } from 'react-router';
import TuitionForm from '../../../components/tuition/TuitionForm';
import { PageHeader } from '../../../components/ui';
import { useCreateTuition } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Reveal } from '../../../motion';

export default function PostTuition() {
  useDocumentTitle('Post a tuition');
  const navigate = useNavigate();
  const create = useCreateTuition();

  const onSubmit = async (payload) => {
    await create.mutateAsync(payload);
    navigate('/dashboard/my-posts');
  };

  return (
    <>
      <PageHeader
        eyebrow="New post"
        title="Post a tuition"
        description="Tell tutors what you need. Our team gives every post a quick review, usually within a few hours, before it goes live."
      />
      <Reveal variant="fade" duration={0.5}>
        <TuitionForm onSubmit={onSubmit} submitLabel="Submit for review" submitting={create.isPending} />
      </Reveal>
    </>
  );
}
