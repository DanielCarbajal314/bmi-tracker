import { useState } from 'react';
import { useParticipantsQuery } from '../../../hooks/use-participant-queries';
import { PAGE_SIZE } from '../constants/page-size';
import type { BmiFilterValue } from '../types/bmi-filter.types';

export function useParticipantsList() {
  const [filter, setFilter] = useState<BmiFilterValue>({});
  const [page, setPage] = useState(1);
  const query = useParticipantsQuery({ ...filter, page, limit: PAGE_SIZE });
  const data = query.data;

  const view = query.isPending
    ? 'loading'
    : !data
      ? 'error'
      : data.items.length === 0
        ? 'empty'
        : 'ready';

  return {
    view,
    participants: data?.items ?? [],
    page: data?.page ?? page,
    totalPages: data?.totalPages ?? 0,
    total: data?.total ?? 0,
    errorMessage: query.error?.message,
    retry: () => void query.refetch(),
    goToPage: setPage,
    applyFilter: (next: BmiFilterValue) => {
      setFilter(next);
      setPage(1);
    },
    clearFilter: () => {
      setFilter({});
      setPage(1);
    },
  };
}
