import { Button } from '@/components/ui/Button';
import { MeasurementFields } from './components/MeasurementFields';
import { ParticipantResult } from './components/ParticipantResult';
import { PersonalFields } from './components/PersonalFields';
import { useParticipantForm } from './hooks/use-participant-form';

export function ParticipantForm() {
  const { form, unitSystem, changeUnitSystem, submit, isSubmitting, created } =
    useParticipantForm();

  return (
    <div className="grid gap-4">
      <form onSubmit={submit} noValidate aria-label="New participant" className="grid gap-4">
        <PersonalFields form={form} />
        <MeasurementFields
          form={form}
          unitSystem={unitSystem}
          onUnitSystemChange={changeUnitSystem}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving…' : 'Save Participant'}
        </Button>
      </form>
      {created && <ParticipantResult participant={created} />}
    </div>
  );
}
