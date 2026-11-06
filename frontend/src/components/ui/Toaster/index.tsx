import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/shared/theme/hooks/use-theme';

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group [--border-radius:var(--radius)] [--normal-bg:var(--popover)] [--normal-border:var(--border)] [--normal-text:var(--popover-foreground)]"
      {...props}
    />
  );
}
