import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithQueryClient } from '@/test/render-with-query-client';
import { stubFetch } from '@/test/stub-fetch';
import type { Participant } from '../apis/participant.contract';
import { fillParticipantForm } from './fill-participant-form';
import { buildPage, buildParticipant } from './participant.fixture';
import { ParticipantsPage } from '..';

describe('ParticipantsPage', () => {
  it('shows a newly saved participant in the list without a reload', async () => {
    const user = userEvent.setup();
    const stored: Participant[] = [];
    stubFetch(({ method }) => {
      if (method === 'POST') {
        const created = buildParticipant({ id: stored.length + 1 });
        stored.push(created);
        return { status: 201, body: created };
      }
      return { body: buildPage([...stored]) };
    });
    renderWithQueryClient(<ParticipantsPage />);
    expect(await screen.findByText('No participants found.')).toBeInTheDocument();

    await fillParticipantForm(user);
    await user.click(screen.getByRole('button', { name: 'Calculate and save' }));

    expect(await screen.findByRole('region', { name: 'Saved participant' })).toBeInTheDocument();
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('No participants found.')).not.toBeInTheDocument();
  });
});
