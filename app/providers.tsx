"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fb-theme") as Theme | null;
      if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      } else {
        setThemeState("light");
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // safe
    }
  }, []);

  const setTheme = (newTheme: Theme | string) => {
    const val: Theme = newTheme === "dark" ? "dark" : "light";
    setThemeState(val);
    try {
      localStorage.setItem("fb-theme", val);
      if (val === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // safe
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
