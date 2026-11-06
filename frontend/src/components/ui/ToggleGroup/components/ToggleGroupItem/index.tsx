import type { ComponentProps } from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/shared/theme/cn';
import { toggleVariants } from '../../constants/toggle-variants';

export function ToggleGroupItem({
  className,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants(),
        'rounded-none border-l-0 first:rounded-l-md first:border-l last:rounded-r-md focus-visible:z-10',
        className,
      )}
      {...props}
    />
  );
}
