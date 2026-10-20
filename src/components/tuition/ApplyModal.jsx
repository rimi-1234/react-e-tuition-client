import { useForm, useWatch } from 'react-hook-form';
import { Banknote, GraduationCap } from 'lucide-react';
import { useApply } from '../../hooks/useApi';
import { useAuth } from '../../providers/AuthProvider';
import { money } from '../../utils/format';
import { Button, Input, Modal, Textarea } from '../ui';

/** Tutor's application form, pre-filled from their profile. */
export function ApplyModal({ open, onClose, tuition }) {
  const { user } = useAuth();
  const apply = useApply({ onSuccess: onClose });
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      qualifications: [user?.qualification, user?.institution].filter(Boolean).join(', '),
      experience: user?.experienceYears || 0,
      expectedSalary: tuition.budget,
      message: '',
    },
  });

  const salary = Number(useWatch({ control, name: 'expectedSalary' })) || 0;
  const diff = salary - tuition.budget;

  const onSubmit = (values) =>
    apply.mutate(
      { tuitionId: tuition.id, ...values, experience: Number(values.experience), expectedSalary: Number(values.expectedSalary) },
      { onError: (err) => Object.entries(err.fieldErrors || {}).forEach(([f, m]) => setError(f, { message: m })) },
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for this tuition"
      description={`${tuition.title} · budget ${money(tuition.budget)}/month`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="apply-form" loading={apply.isPending}>
            Send application
          </Button>
        </>
      }
    >
      <form id="apply-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Qualifications"
          icon={GraduationCap}
          required
          placeholder="e.g. B.Sc in Physics, University of Dhaka"
          error={errors.qualifications?.message}
          {...register('qualifications', { required: 'Tell the student about your qualifications', minLength: { value: 3, message: 'Too short' } })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Teaching experience (years)"
            type="number"
            min={0}
            max={60}
            required
            error={errors.experience?.message}
            {...register('experience', { required: 'Required', min: { value: 0, message: 'Must be 0 or more' }, max: { value: 60, message: 'Too high' } })}
          />
          <Input
            label="Your monthly rate (৳)"
            type="number"
            icon={Banknote}
            min={500}
            required
            error={errors.expectedSalary?.message}
            hint={diff === 0 ? 'Matches the student’s budget' : diff > 0 ? `${money(diff)} above budget` : `${money(-diff)} below budget`}
            {...register('expectedSalary', { required: 'Required', min: { value: 500, message: 'At least ৳500' } })}
          />
        </div>
        <Textarea
          label="Message to the student"
          rows={4}
          placeholder="Introduce yourself, your teaching approach and when you can start."
          hint="Optional, but applications with a short note get hired more often."
          error={errors.message?.message}
          {...register('message', { maxLength: { value: 1000, message: 'Keep it under 1000 characters' } })}
        />
      </form>
    </Modal>
  );
}
