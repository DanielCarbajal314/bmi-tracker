import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn('h-10 px-2 text-left align-middle font-medium whitespace-nowrap', className)}
      {...props}
    />
  );
}
