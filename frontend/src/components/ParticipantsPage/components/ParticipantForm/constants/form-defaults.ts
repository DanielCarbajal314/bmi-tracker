import type { CreateParticipantInput } from '../../../apis/participant.contract';

export const FORM_DEFAULTS: Partial<CreateParticipantInput> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  unitPicked: 'imperial',
};
