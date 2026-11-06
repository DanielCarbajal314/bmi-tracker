import { request } from '@/shared/api/request';
import {
  type CreateParticipantInput,
  type ListParticipantsParams,
  type Participant,
  type ParticipantPage,
  ParticipantPageSchema,
  ParticipantSchema,
} from './participant.contract';

export function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  return request('/participants', ParticipantSchema, { method: 'POST', body: input });
}

export function listParticipants(params: ListParticipantsParams): Promise<ParticipantPage> {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) query.set(name, String(value));
  }
  return request(`/participants?${query}`, ParticipantPageSchema);
}
