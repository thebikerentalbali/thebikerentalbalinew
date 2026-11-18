"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = "w-10 h-10" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`cirrel-ibtn cursor-pointer active-press shrink-0 ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-[#0b1220]" aria-hidden="true" />
      )}
    </button>
  )
}
