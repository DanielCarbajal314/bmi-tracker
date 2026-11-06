import type { ComponentProps } from 'react';

export function TableBody(props: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" {...props} />;
}
