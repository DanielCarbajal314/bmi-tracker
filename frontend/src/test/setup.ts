import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Dates are shown in the viewer's timezone; pin it so assertions do not depend on the machine.
process.env.TZ = 'UTC';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
