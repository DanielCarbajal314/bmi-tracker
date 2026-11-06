import type { ComponentProps } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Input } from '@/components/ui/Input';
import type { CreateParticipantInput } from '../../../../../apis/participant.contract';

export type FormFieldProps = Pick<
  ComponentProps<typeof Input>,
  'type' | 'inputMode' | 'step' | 'placeholder' | 'autoComplete'
> & {
  form: UseFormReturn<CreateParticipantInput>;
  name: Exclude<keyof CreateParticipantInput, 'unitPicked'>;
  label: string;
  numeric?: boolean;
};
