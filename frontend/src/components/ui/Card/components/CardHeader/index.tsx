import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('grid auto-rows-min items-start gap-2 px-6', className)}
      {...props}
    />
  );
}
