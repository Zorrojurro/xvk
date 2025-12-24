"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import ThemeToggle from "./ThemeToggle"

const nav = [
  { label: "About", href: "/#about" },
  { label: "Wings", href: "/#wings" },
  { label: "History", href: "/#history" },
  { label: "What We Do", href: "/#work" },
  { label: "Events", href: "/events" },
  { label: "Experiences", href: "/experiences" },
  { label: "Contact", href: "/contact" },
]

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700">
            <Image
              src="/brand/xvksg-logo.png"
              alt="XV Kanteerava Scouts & Guides"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-extrabold">XV Kanteerava</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Open Scout Unit | Since 1950</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-slate-700 hover:text-[#622599] dark:text-slate-200 dark:hover:text-[#c7a8ff]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/experiences/new" className="btn-primary hidden sm:inline-flex">
            Share a Story
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/60 md:hidden dark:border-slate-700 dark:bg-slate-900/60"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <nav className="container-x grid gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/experiences/new"
              className="mt-2 btn-primary text-center"
              onClick={() => setMobileOpen(false)}
            >
              Share a Story
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
