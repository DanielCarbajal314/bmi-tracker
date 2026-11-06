import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listParticipants } from '../apis/participant.api';
import type { ListParticipantsParams } from '../apis/participant.contract';
import { participantKeys } from './participant.keys';

export function useParticipantsQuery(params: ListParticipantsParams) {
  return useQuery({
    queryKey: participantKeys.list(params),
    queryFn: () => listParticipants(params),
    placeholderData: keepPreviousData,
  });
}
