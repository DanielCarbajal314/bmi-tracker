import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '..';

let crash = false;

function Flaky() {
  if (crash) throw new Error('boom');
  return <p>All good</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    crash = false;
    // React and the boundary both log the error they catch: keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children while nothing fails', () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('replaces a crashing page with a message and a way to try again', () => {
    crash = true;

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });

  it('shows the page again when it works on the next try', async () => {
    const user = userEvent.setup();
    crash = true;
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    crash = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
