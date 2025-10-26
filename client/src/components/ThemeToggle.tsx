import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-10 h-10 p-0"
      data-testid="button-theme-toggle"
      aria-label={theme === 'dark' ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
      )}
    </Button>
  );
}
