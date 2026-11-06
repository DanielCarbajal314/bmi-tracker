import type { ListParticipantsParams } from '../../../apis/participant.contract';

export type BmiFilterValue = Pick<ListParticipantsParams, 'minBmi' | 'maxBmi'>;
