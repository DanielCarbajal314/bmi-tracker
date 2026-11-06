import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

// Fills the form in the default unit system (imperial).
export async function fillParticipantForm(user: UserEvent) {
  await user.type(screen.getByLabelText('First Name'), 'Ada');
  await user.type(screen.getByLabelText('Last Name'), 'Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Phone'), '+1 555 123 4567');
  await user.type(screen.getByLabelText('Age'), '30');
  await user.type(screen.getByLabelText('Weight (lbs)'), '154.3');
  await user.type(screen.getByLabelText('Height (in)'), '69');
}
