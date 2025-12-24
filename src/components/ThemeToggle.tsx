"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-900/60"
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/60 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
