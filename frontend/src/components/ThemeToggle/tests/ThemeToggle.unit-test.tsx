import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { setTheme } from '@/shared/theme/theme';
import { ThemeToggle } from '..';

afterEach(() => {
  setTheme('dark');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('starts in dark mode and offers the light one', () => {
    setTheme('dark');
    render(<ThemeToggle />);

    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('switches the page theme and remembers the choice', async () => {
    const user = userEvent.setup();
    setTheme('dark');
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });
});
