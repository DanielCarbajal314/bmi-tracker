import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('border-b transition-colors hover:bg-muted/50', className)}
      {...props}
    />
  );
}
