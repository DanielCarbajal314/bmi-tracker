import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2 data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />
  );
}
