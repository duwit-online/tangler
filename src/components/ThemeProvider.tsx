import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ColorScheme = {
  name: string;
  primary: string;
  accent: string;
};

const defaultColorSchemes: ColorScheme[] = [
  { name: 'Wine', primary: '345 60% 40%', accent: '340 75% 55%' },
  { name: 'Coral', primary: '5 85% 65%', accent: '340 75% 55%' },
  { name: 'Ocean', primary: '210 85% 55%', accent: '195 90% 50%' },
  { name: 'Forest', primary: '150 60% 40%', accent: '120 50% 45%' },
  { name: 'Sunset', primary: '25 90% 55%', accent: '15 95% 60%' },
  { name: 'Purple', primary: '270 70% 55%', accent: '280 75% 60%' },
  { name: 'Gold', primary: '45 90% 50%', accent: '35 95% 55%' },
  { name: 'Rose', primary: '350 80% 60%', accent: '340 85% 65%' },
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
        return defaultColorSchemes[0]; // Wine is default
      }
    }
    return defaultColorSchemes[0]; // Wine is default
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
