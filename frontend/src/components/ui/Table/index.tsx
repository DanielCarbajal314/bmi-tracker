import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export { TableBody } from './components/TableBody';
export { TableCell } from './components/TableCell';
export { TableHead } from './components/TableHead';
export { TableHeader } from './components/TableHeader';
export { TableRow } from './components/TableRow';

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}
