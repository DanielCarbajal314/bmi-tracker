import type { UseFormReturn } from 'react-hook-form';
import type { CreateParticipantInput } from '../../../../apis/participant.contract';
import { FormField } from '../FormField';

export function PersonalFields({ form }: { form: UseFormReturn<CreateParticipantInput> }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField form={form} name="firstName" label="First Name" autoComplete="given-name" />
        <FormField form={form} name="lastName" label="Last Name" autoComplete="family-name" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField form={form} name="email" label="Email" type="email" autoComplete="email" />
        <FormField form={form} name="phone" label="Phone" type="tel" autoComplete="tel" />
      </div>
    </div>
  );
}
