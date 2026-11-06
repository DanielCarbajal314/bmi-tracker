import { Button } from '@/components/ui/Button';
import { useTheme } from '@/shared/theme/hooks/use-theme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button
      type="button"
      variant="success"
      aria-label={`Switch to ${next} mode`}
      onClick={toggle}
      className="absolute top-3 right-2 z-10 h-11 w-14 text-xl"
    >
      <span aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
    </Button>
  );
}
