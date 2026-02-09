import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ColorScheme = {
  name: string;
  primary: string;
  accent: string;
};

const defaultColorSchemes: ColorScheme[] = [
  { name: 'Coral Rose', primary: '5 75% 65%', accent: '270 40% 72%' },
  { name: 'Blush', primary: '340 65% 62%', accent: '270 45% 75%' },
  { name: 'Sunset', primary: '25 85% 58%', accent: '340 70% 60%' },
  { name: 'Lavender', primary: '270 45% 62%', accent: '340 60% 65%' },
  { name: 'Ocean', primary: '195 75% 50%', accent: '210 70% 60%' },
  { name: 'Forest', primary: '160 55% 45%', accent: '140 45% 50%' },
  { name: 'Berry', primary: '320 65% 52%', accent: '280 55% 58%' },
  { name: 'Gold', primary: '40 85% 55%', accent: '25 80% 60%' },
];

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  colorSchemes: ColorScheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'tangle-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem(`${storageKey}-color`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultColorSchemes[0];
      }
    }
    return defaultColorSchemes[0];
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply color scheme
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary', colorScheme.primary);
    root.style.setProperty('--accent', colorScheme.accent);
    root.style.setProperty('--ring', colorScheme.primary);
  }, [colorScheme]);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem(`${storageKey}-color`, JSON.stringify(scheme));
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    colorScheme,
    setColorScheme,
    colorSchemes: defaultColorSchemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
