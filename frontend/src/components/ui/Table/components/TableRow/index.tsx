import type { ComponentProps } from 'react';

export function TableRow(props: ComponentProps<'tr'>) {
  return <tr data-slot="table-row" {...props} />;
}
