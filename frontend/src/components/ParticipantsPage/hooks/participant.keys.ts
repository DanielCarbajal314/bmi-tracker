import type { ListParticipantsParams } from '../apis/participant.contract';

export const participantKeys = {
  all: ['participants'] as const,
  list: (params: ListParticipantsParams) => [...participantKeys.all, 'list', params] as const,
};
