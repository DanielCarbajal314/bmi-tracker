import type { UseFormReturn } from 'react-hook-form';
import type { CreateParticipantInput } from '../../../../apis/participant.contract';
import { FormField } from '../FormField';

export function PersonalFields({ form }: { form: UseFormReturn<CreateParticipantInput> }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField form={form} name="firstName" label="First name" autoComplete="given-name" />
        <FormField form={form} name="lastName" label="Last name" autoComplete="family-name" />
      </div>
      <FormField form={form} name="email" label="Email" type="email" autoComplete="email" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField form={form} name="phone" label="Phone" type="tel" autoComplete="tel" />
        <FormField
          form={form}
          name="age"
          label="Age"
          type="number"
          inputMode="numeric"
          step="1"
          numeric
        />
      </div>
    </div>
  );
}
