import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  type CreateParticipantInput,
  CreateParticipantSchema,
  type Participant,
  type UnitSystem,
} from '../../../apis/participant.contract';
import { useCreateParticipantMutation } from '../../../hooks/use-participant-mutations';
import { FORM_DEFAULTS } from '../constants/form-defaults';
import { convertHeight, convertWeight } from '../measurement.converter';

export function useParticipantForm() {
  const form = useForm<CreateParticipantInput>({
    resolver: zodResolver(CreateParticipantSchema),
    defaultValues: FORM_DEFAULTS,
    mode: 'onTouched',
  });
  const { mutate, isPending } = useCreateParticipantMutation();
  const [created, setCreated] = useState<Participant | null>(null);
  const unitSystem = form.watch('unitPicked');

  // Switching the system converts what is already typed, so the values stay valid.
  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    const { weight, height } = form.getValues();
    const options = { shouldValidate: form.formState.isSubmitted };
    if (Number.isFinite(weight))
      form.setValue('weight', convertWeight(weight, unitSystem, next), options);
    if (Number.isFinite(height))
      form.setValue('height', convertHeight(height, unitSystem, next), options);
    form.setValue('unitPicked', next);
  }

  // Errors are reported centrally by the query client, so there is no catch here.
  const submit = form.handleSubmit((values) => {
    mutate(values, {
      onSuccess: (participant) => {
        setCreated(participant);
        // reset() with no argument also empties the number inputs, which have no default value.
        form.reset();
        form.setValue('unitPicked', values.unitPicked);
      },
    });
  });

  return { form, unitSystem, changeUnitSystem, submit, isSubmitting: isPending, created };
}
