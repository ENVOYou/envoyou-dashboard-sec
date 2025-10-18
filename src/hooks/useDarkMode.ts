import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);

    // Function to update dark mode based on theme
    const updateDarkMode = () => {
      const root = document.documentElement;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let shouldBeDark = false;

      switch (savedTheme) {
        case 'dark':
          shouldBeDark = true;
          break;
        case 'light':
          shouldBeDark = false;
          break;
        case 'system':
        default:
          shouldBeDark = systemPrefersDark;
          break;
      }

      setIsDark(shouldBeDark);

      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateDarkMode();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Trigger the useEffect to update the DOM
    const event = new Event('theme-change');
    window.dispatchEvent(event);
  };

  return {
    theme,
    isDark,
    setTheme: setThemeMode,
    toggleTheme: () => setThemeMode(isDark ? 'light' : 'dark'),
  };
}