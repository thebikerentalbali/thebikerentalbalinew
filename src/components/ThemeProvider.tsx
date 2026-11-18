"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type ThemeMode = "light" | "dark"

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tbrb:theme")
      const initial: ThemeMode = saved === "dark" ? "dark" : "light"
      setThemeState(initial)
      document.documentElement.dataset.theme = initial
      document.documentElement.classList.toggle("dark", initial === "dark")
    } catch {
      document.documentElement.dataset.theme = "light"
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const setTheme = (next: ThemeMode) => {
    setThemeState(next)
    try {
      localStorage.setItem("tbrb:theme", next)
    } catch {}
    document.documentElement.dataset.theme = next
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
