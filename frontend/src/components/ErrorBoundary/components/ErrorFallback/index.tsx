import { Button } from '@/components/ui/Button';
import type { ErrorFallbackProps } from './types/error-fallback-props.types';

export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <div role="alert" className="grid gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          The page hit an unexpected problem. Try again, and reload the page if it keeps happening.
        </p>
      </div>
      <Button type="button" onClick={onRetry}>
        Try again
      </Button>
    </main>
  );
}
