import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

// Fills the metric form, which is the default unit system.
export async function fillParticipantForm(user: UserEvent) {
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Phone'), '+1 555 123 4567');
  await user.type(screen.getByLabelText('Age'), '30');
  await user.type(screen.getByLabelText('Weight (kg)'), '70');
  await user.type(screen.getByLabelText('Height (m)'), '1.75');
}
