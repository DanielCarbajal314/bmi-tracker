import type { ComponentProps } from 'react';
import { cn } from '@/shared/theme/cn';

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}
