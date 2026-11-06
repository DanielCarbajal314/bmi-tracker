import { ThemeToggle } from '@/components/ThemeToggle';
import { ParticipantForm } from './components/ParticipantForm';
import { ParticipantsList } from './components/ParticipantsList';

export function ParticipantsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-10">
      <ThemeToggle />
      <header>
        {/* Right padding keeps the title clear of the theme button on narrow screens. */}
        <h1 className="pr-16 text-2xl font-bold tracking-tight">
          Clinical Trial Participant Capture
        </h1>
      </header>
      <ParticipantForm />
      <ParticipantsList />
    </main>
  );
}
