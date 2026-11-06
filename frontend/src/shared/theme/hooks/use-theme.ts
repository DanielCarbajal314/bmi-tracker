import { useSyncExternalStore } from 'react';
import { getTheme, setTheme, subscribeToTheme } from '../theme';

export function useTheme() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme);

  function toggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return { theme, toggle };
}
