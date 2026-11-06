import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ParticipantsPage } from '@/components/ParticipantsPage';
import { Toaster } from '@/components/ui/Toaster';
import { createQueryClient } from '@/shared/api/query-client';
import { initTheme } from '@/shared/theme/theme';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

initTheme();

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={createQueryClient()}>
        <ParticipantsPage />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
