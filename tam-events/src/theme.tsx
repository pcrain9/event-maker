import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext, themeOptions, type ThemeId } from "./theme-context.ts";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeId>("classic");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "classic") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, themes: themeOptions }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
