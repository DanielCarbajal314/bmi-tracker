import type { ComponentProps } from 'react';

export function TableHeader(props: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" {...props} />;
}
