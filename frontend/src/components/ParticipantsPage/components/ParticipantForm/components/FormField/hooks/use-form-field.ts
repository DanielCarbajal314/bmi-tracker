import type { UseFormReturn } from 'react-hook-form';
import type { CreateParticipantInput } from '../../../../../apis/participant.contract';

export function useFormField(
  form: UseFormReturn<CreateParticipantInput>,
  name: keyof CreateParticipantInput,
  numeric: boolean,
) {
  const error = form.formState.errors[name]?.message;
  const registration = form.register(name, numeric ? { valueAsNumber: true } : undefined);

  return { error, errorId: `${name}-error`, registration };
}
