import { Button } from '@/components/ui/Button';
import type { PaginationProps } from './types/pagination-props.types';

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? 'participant' : 'participants'} · Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
