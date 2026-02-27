import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ColorScheme = {
  name: string;
  primary: string;
  accent: string;
};

const defaultColorSchemes: ColorScheme[] = [
  { name: 'Obsidian Teal', primary: '181 82% 24%', accent: '200 40% 56%' },
  { name: 'Deep Pine', primary: '180 40% 10%', accent: '181 82% 24%' },
  { name: 'Steel Blue', primary: '200 40% 56%', accent: '200 40% 26%' },
  { name: 'Cyan', primary: '180 85% 33%', accent: '181 82% 24%' },
  { name: 'Ocean', primary: '195 75% 40%', accent: '210 70% 50%' },
  { name: 'Forest', primary: '160 55% 35%', accent: '140 45% 40%' },
  { name: 'Emerald', primary: '152 60% 38%', accent: '160 50% 30%' },
  { name: 'Midnight', primary: '200 35% 22%', accent: '180 30% 35%' },
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
  storageKey = 'plurr-theme',
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
