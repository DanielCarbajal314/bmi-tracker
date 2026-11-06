import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithQueryClient } from '@/test/render-with-query-client';
import { stubFetch } from '@/test/stub-fetch';
import { fillParticipantForm } from '../../../tests/fill-participant-form';
import { buildParticipant } from '../../../tests/participant.fixture';
import { ParticipantForm } from '..';

const submitButton = () => screen.getByRole('button', { name: 'Calculate and save' });

describe('ParticipantForm', () => {
  it('asks for every required field and sends nothing', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(() => ({ body: buildParticipant() }));
    renderWithQueryClient(<ParticipantForm />);

    await user.click(submitButton());

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(
      expect.arrayContaining(['Required', 'Enter a valid email', 'Enter a number']),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('starts in the metric system and relabels both fields when the system changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ParticipantForm />);

    expect(screen.getByLabelText('Weight (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Height (m)')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Imperial' }));

    expect(screen.getByLabelText('Weight (lb)')).toBeInTheDocument();
    expect(screen.getByLabelText('Height (in)')).toBeInTheDocument();
  });

  it('converts the typed weight and height when the system changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ParticipantForm />);
    await user.type(screen.getByLabelText('Weight (kg)'), '70');
    await user.type(screen.getByLabelText('Height (m)'), '1.75');

    await user.click(screen.getByRole('radio', { name: 'Imperial' }));

    expect(screen.getByLabelText('Weight (lb)')).toHaveValue(154.32);
    expect(screen.getByLabelText('Height (in)')).toHaveValue(68.9);
  });

  it('names the allowed range for the chosen system', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ParticipantForm />);
    await fillParticipantForm(user);
    await user.clear(screen.getByLabelText('Weight (kg)'));
    await user.type(screen.getByLabelText('Weight (kg)'), '5000');

    await user.click(submitButton());

    expect(await screen.findByText('Must be between 1 and 700 kg')).toBeInTheDocument();
  });

  it('sends the participant, shows the calculated BMI and clears the form', async () => {
    const user = userEvent.setup();
    let sent: unknown;
    stubFetch(({ body }) => {
      sent = body;
      return { status: 201, body: buildParticipant({ id: 4, bmi: 22.86 }) };
    });
    renderWithQueryClient(<ParticipantForm />);
    await fillParticipantForm(user);

    await user.click(submitButton());

    const result = await screen.findByRole('region', { name: 'Saved participant' });
    expect(within(result).getByText('22.86')).toBeInTheDocument();
    expect(within(result).getByText(/Saved as #4/)).toBeInTheDocument();
    expect(sent).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '+1 555 123 4567',
      unitPicked: 'metric',
      weight: 70,
      height: 1.75,
      age: 30,
    });
    expect(screen.getByLabelText('First name')).toHaveValue('');
    expect(screen.getByLabelText('Weight (kg)')).toHaveValue(null);
  });

  it('keeps the chosen unit system after saving', async () => {
    const user = userEvent.setup();
    stubFetch(() => ({ status: 201, body: buildParticipant({ unitPicked: 'imperial' }) }));
    renderWithQueryClient(<ParticipantForm />);
    await user.click(screen.getByRole('radio', { name: 'Imperial' }));
    await user.type(screen.getByLabelText('First name'), 'Ada');
    await user.type(screen.getByLabelText('Last name'), 'Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Phone'), '5551234567');
    await user.type(screen.getByLabelText('Age'), '30');
    await user.type(screen.getByLabelText('Weight (lb)'), '154.3');
    await user.type(screen.getByLabelText('Height (in)'), '69');

    await user.click(submitButton());

    await screen.findByRole('region', { name: 'Saved participant' });
    expect(screen.getByLabelText('Weight (lb)')).toBeInTheDocument();
  });

  it('shows no result when the server rejects the participant', async () => {
    const user = userEvent.setup();
    stubFetch(() => ({ status: 500, body: { statusCode: 500, message: 'Internal server error' } }));
    renderWithQueryClient(<ParticipantForm />);
    await fillParticipantForm(user);

    await user.click(submitButton());

    await screen.findByRole('button', { name: 'Calculate and save' });
    expect(screen.queryByRole('region', { name: 'Saved participant' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveValue('Ada');
  });
});
