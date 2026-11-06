import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'border border-border bg-muted px-3 py-3.5 text-left align-middle font-bold',
        className,
      )}
      {...props}
    />
  );
}
