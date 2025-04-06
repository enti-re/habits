'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

export default function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
}
