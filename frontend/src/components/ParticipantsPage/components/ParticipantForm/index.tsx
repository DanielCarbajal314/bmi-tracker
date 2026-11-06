import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { MeasurementFields } from './components/MeasurementFields';
import { ParticipantResult } from './components/ParticipantResult';
import { PersonalFields } from './components/PersonalFields';
import { useParticipantForm } from './hooks/use-participant-form';

export function ParticipantForm() {
  const { form, unitSystem, changeUnitSystem, submit, isSubmitting, created } =
    useParticipantForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>New participant</CardTitle>
        <CardDescription>The BMI is calculated when you save.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form onSubmit={submit} noValidate className="grid gap-6">
          <PersonalFields form={form} />
          <MeasurementFields
            form={form}
            unitSystem={unitSystem}
            onUnitSystemChange={changeUnitSystem}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Calculate and save'}
          </Button>
        </form>
        {created && <ParticipantResult participant={created} />}
      </CardContent>
    </Card>
  );
}
