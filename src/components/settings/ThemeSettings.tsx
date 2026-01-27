import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Check, Palette } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ThemeSettings = () => {
  const { theme, setTheme, colorScheme, setColorScheme, colorSchemes } = useTheme();

  const themes = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      {/* Theme mode */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Appearance
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={theme === id ? 'default' : 'outline'}
              onClick={() => setTheme(id)}
              className={cn(
                'h-auto py-3 flex-col gap-1.5 rounded-xl',
                theme === id && 'gradient-primary border-0'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Color scheme */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {colorSchemes.map((scheme) => (
            <motion.button
              key={scheme.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setColorScheme(scheme)}
              className={cn(
                'relative aspect-square rounded-xl flex items-center justify-center transition-all',
                colorScheme.name === scheme.name && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
              )}
              style={{
                background: `linear-gradient(135deg, hsl(${scheme.primary}), hsl(${scheme.accent}))`,
              }}
            >
              {colorScheme.name === scheme.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Current: {colorScheme.name}
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
