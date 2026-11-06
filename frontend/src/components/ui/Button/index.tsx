import type { ComponentProps } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/theme/cn';
import { buttonVariants } from './constants/button-variants';

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
