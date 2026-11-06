import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BmiFilter } from '..';

function setup() {
  const onApply = vi.fn();
  const onClear = vi.fn();
  render(<BmiFilter onApply={onApply} onClear={onClear} />);
  return { onApply, onClear, user: userEvent.setup() };
}

describe('BmiFilter', () => {
  it('applies the min and max it was given', async () => {
    const { user, onApply } = setup();

    await user.type(screen.getByLabelText('Min BMI'), '18.5');
    await user.type(screen.getByLabelText('Max BMI'), '24.9');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    expect(onApply).toHaveBeenCalledWith({ minBmi: 18.5, maxBmi: 24.9 });
  });

  it('treats an empty field as no bound', async () => {
    const { user, onApply } = setup();

    await user.type(screen.getByLabelText('Min BMI'), '30');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    expect(onApply).toHaveBeenCalledWith({ minBmi: 30, maxBmi: undefined });
  });

  it('refuses a minimum above the maximum', async () => {
    const { user, onApply } = setup();

    await user.type(screen.getByLabelText('Min BMI'), '30');
    await user.type(screen.getByLabelText('Max BMI'), '20');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Minimum BMI cannot be greater than maximum BMI',
    );
    expect(onApply).not.toHaveBeenCalled();
  });

  it('refuses a negative BMI', async () => {
    const { user, onApply } = setup();

    await user.type(screen.getByLabelText('Min BMI'), '-5');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter BMI values of 0 or more');
    expect(onApply).not.toHaveBeenCalled();
  });

  it('clears both fields and reports it', async () => {
    const { user, onClear } = setup();
    await user.type(screen.getByLabelText('Min BMI'), '18');
    await user.type(screen.getByLabelText('Max BMI'), '25');

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByLabelText('Min BMI')).toHaveValue(null);
    expect(screen.getByLabelText('Max BMI')).toHaveValue(null);
    expect(onClear).toHaveBeenCalledOnce();
  });
});
