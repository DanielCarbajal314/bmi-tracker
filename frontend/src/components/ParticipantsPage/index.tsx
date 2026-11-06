import { ParticipantForm } from './components/ParticipantForm';
import { ParticipantsList } from './components/ParticipantsList';

export function ParticipantsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">BMI Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Register a participant to calculate their BMI, and browse everyone registered so far.
        </p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <ParticipantForm />
        <ParticipantsList />
      </div>
    </main>
  );
}
