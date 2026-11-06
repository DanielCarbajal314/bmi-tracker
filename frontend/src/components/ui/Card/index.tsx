import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export { CardContent } from './components/CardContent';
export { CardDescription } from './components/CardDescription';
export { CardHeader } from './components/CardHeader';
export { CardTitle } from './components/CardTitle';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
