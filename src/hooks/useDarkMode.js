import { useEffect, useState } from 'react';

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Apply dark mode class to the root element
    const applyDarkMode = (dark) => {
        if (dark) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    };

    useEffect(() => {
        // Get saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Determine initial theme
        let initialTheme = 'light';
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            initialTheme = 'dark';
        }

        // Apply initial theme
        setIsDarkMode(initialTheme === 'dark');
        applyDarkMode(initialTheme === 'dark');
        setIsMounted(true);
        
        // Listen for system theme changes (only if no saved preference)
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (!localStorage.getItem('theme')) {
                const newIsDark = mediaQuery.matches;
                setIsDarkMode(newIsDark);
                applyDarkMode(newIsDark);
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        const theme = newDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyDarkMode(newDarkMode);
    };

    return [isDarkMode, toggleDarkMode];
}
