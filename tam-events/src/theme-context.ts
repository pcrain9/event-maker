import { createContext } from "react";

type ThemeId = "classic" | "harbor" | "citrus";

type ThemeOption = {
  id: ThemeId;
  label: string;
};

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (nextTheme: ThemeId) => void;
  themes: ThemeOption[];
};

const themeOptions: ThemeOption[] = [
  { id: "classic", label: "Heritage Clay" },
  { id: "harbor", label: "Harbor Studio" },
  { id: "citrus", label: "Citrus Press" },
];

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export { ThemeContext, themeOptions };
export type { ThemeContextValue, ThemeId, ThemeOption };
