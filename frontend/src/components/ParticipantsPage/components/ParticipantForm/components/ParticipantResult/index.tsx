import type { Participant } from '../../../../apis/participant.contract';

export function ParticipantResult({ participant }: { participant: Participant }) {
  return (
    <section
      aria-label="Saved participant"
      className="grid gap-3 rounded-lg border bg-muted/40 p-4"
    >
      <p className="text-sm text-muted-foreground">
        Saved as #{participant.id} for {participant.firstName}
      </p>
      <p className="text-3xl font-semibold">
        <span className="text-base font-normal text-muted-foreground">BMI </span>
        {participant.bmi}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Weight</dt>
        <dd>
          {participant.weightInKilos} kg · {participant.weightInLbs} lbs
        </dd>
        <dt className="text-muted-foreground">Height</dt>
        <dd>
          {participant.heightInMeters} m · {participant.heightInInches} in
        </dd>
      </dl>
    </section>
  );
}
