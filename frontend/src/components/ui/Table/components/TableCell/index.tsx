import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('p-2 align-middle whitespace-nowrap', className)}
      {...props}
    />
  );
}
