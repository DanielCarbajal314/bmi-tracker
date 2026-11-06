import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('border border-border px-3 py-3.5 align-middle', className)}
      {...props}
    />
  );
}
