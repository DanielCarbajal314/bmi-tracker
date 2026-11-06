import type { ComponentProps } from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/shared/theme/cn';

export { ToggleGroupItem } from './components/ToggleGroupItem';

export function ToggleGroup({
  className,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('flex w-fit items-center rounded-md', className)}
      {...props}
    />
  );
}
