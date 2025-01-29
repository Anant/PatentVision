import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Retrieve the stored theme from localStorage or default to system preference
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Button
      onClick={toggleTheme}
      className="relative w-14 h-8 bg-gray-800 dark:bg-gray-200 rounded-full transition-colors duration-300 focus:outline-none"
      aria-label="Toggle Theme"
    >
      {/* Sun Icon */}
      <span className="absolute left-2 top-2">
        <Sun
          className={`h-4 w-4 text-yellow-400 ${
            theme === 'dark' ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
        />
      </span>
      {/* Moon Icon */}
      <span className="absolute right-2 top-2">
        <Moon
          className={`h-4 w-4 text-gray-800 dark:text-gray-200 ${
            theme === 'light' ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
        />
      </span>
      {/* Toggle Circle */}
      <div
        className={`absolute top-1.5 left-1.5 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-6' : ''
        }`}
      ></div>
    </Button>
  );
}
