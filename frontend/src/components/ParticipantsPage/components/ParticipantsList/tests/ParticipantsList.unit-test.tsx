import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SERVER_ERROR_MESSAGE } from '@/shared/api/constants/error-messages';
import { renderWithQueryClient } from '@/test/render-with-query-client';
import { stubFetch } from '@/test/stub-fetch';
import { buildPage, buildParticipant } from '../../../tests/participant.fixture';
import { ParticipantsList } from '..';

const ada = buildParticipant({ id: 1, firstName: 'Ada', bmi: 22.86 });
const grace = buildParticipant({
  id: 2,
  firstName: 'Grace',
  email: 'grace@example.com',
  unitPicked: 'imperial',
  weightInLbs: 154.3,
  heightInInches: 69,
  bmi: 22.78,
});

describe('ParticipantsList', () => {
  it('shows a loading state, then one row per participant', async () => {
    stubFetch(() => ({ body: buildPage([ada, grace]) }));
    renderWithQueryClient(<ParticipantsList />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading participants…');

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]!).getByText('Ada')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('70 kg')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('1.75 m')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('154.3 lb')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('69 in')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('22.78')).toBeInTheDocument();
  });

  it('says so when there is nobody to show', async () => {
    stubFetch(() => ({ body: buildPage([]) }));
    renderWithQueryClient(<ParticipantsList />);

    expect(await screen.findByText('No participants found.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('asks the first page of 10 by default', async () => {
    const fetchMock = stubFetch(() => ({ body: buildPage([ada]) }));
    renderWithQueryClient(<ParticipantsList />);

    await screen.findByText('Ada');

    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(Object.fromEntries(new URL(String(url), 'http://localhost').searchParams)).toEqual({
      page: '1',
      limit: '10',
    });
  });

  it('requests the BMI range from page 1 when the filter is applied', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(() => ({ body: buildPage([ada]) }));
    renderWithQueryClient(<ParticipantsList />);
    await screen.findByText('Ada');

    await user.type(screen.getByLabelText('Min BMI'), '20');
    await user.type(screen.getByLabelText('Max BMI'), '30');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await screen.findByText('Ada');
    const [url] = fetchMock.mock.calls.at(-1) ?? [];
    expect(Object.fromEntries(new URL(String(url), 'http://localhost').searchParams)).toEqual({
      minBmi: '20',
      maxBmi: '30',
      page: '1',
      limit: '10',
    });
  });

  it('drops the filter when it is cleared', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(() => ({ body: buildPage([ada]) }));
    renderWithQueryClient(<ParticipantsList />);
    await screen.findByText('Ada');
    await user.type(screen.getByLabelText('Min BMI'), '20');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    await screen.findByText('Ada');
    const [url] = fetchMock.mock.calls.at(-1) ?? [];
    expect(new URL(String(url), 'http://localhost').searchParams.has('minBmi')).toBe(false);
  });

  it('moves between pages and disables the buttons at the ends', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(({ search }) => ({
      body: buildPage([ada], { page: Number(search.get('page')), total: 25, totalPages: 3 }),
    }));
    renderWithQueryClient(<ParticipantsList />);
    await screen.findByText('25 participants · Page 1 of 3');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('25 participants · Page 2 of 3');
    const [url] = fetchMock.mock.calls.at(-1) ?? [];
    expect(new URL(String(url), 'http://localhost').searchParams.get('page')).toBe('2');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('shows the error inline and loads again on retry', async () => {
    const user = userEvent.setup();
    let failing = true;
    stubFetch(() =>
      failing
        ? { status: 500, body: { statusCode: 500, message: 'Internal server error' } }
        : { body: buildPage([ada]) },
    );
    renderWithQueryClient(<ParticipantsList />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      `Could not load participants: ${SERVER_ERROR_MESSAGE}`,
    );

    failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Ada')).toBeInTheDocument();
  });
});
