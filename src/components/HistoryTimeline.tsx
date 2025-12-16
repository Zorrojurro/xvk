"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export type TimelineItem = {
  id?: string
  year: string
  title: string
  summary: string
  details?: string[]
  tags?: string[]
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ")
}

export default function HistoryTimeline({
  items,
  accent = "#622599",
  defaultOpenIndex = 0,
}: {
  items: TimelineItem[]
  accent?: string
  defaultOpenIndex?: number
}) {
  const [openIndex, setOpenIndex] = React.useState<number>(() => {
    if (items.length === 0) return -1
    if (defaultOpenIndex < 0) return -1
    return Math.min(defaultOpenIndex, items.length - 1)
  })

  const refs = React.useRef<Array<HTMLDivElement | null>>([])

  function focusItem(i: number) {
    setOpenIndex(i) // chips always open that item
    const el = refs.current[i]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  return (
    <div className="w-full">
      {/* Year chips */}
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => {
          const active = i === openIndex
          return (
            <button
              key={it.id ?? `${it.year}-${it.title}`}
              type="button"
              onClick={() => focusItem(i)}
              className={cx(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950",
                active
                  ? "border-transparent text-white"
                  : "border-slate-200 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/60",
              )}
              style={active ? { backgroundColor: accent } : undefined}
              aria-current={active ? "true" : "false"}
            >
              {it.year}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/30 md:p-6">
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="grid gap-4">
            {items.map((it, i) => {
              const isOpen = i === openIndex
              const key = it.id ?? `${it.year}-${it.title}`
              const panelId = `timeline-panel-${i}`

              return (
                <div
                  key={key}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  className="relative pl-10"
                >
                  {/* dot */}
                  <div
                    className={cx(
                      "absolute left-[10px] top-4 h-3 w-3 rounded-full border",
                      isOpen
                        ? "border-transparent"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950",
                    )}
                    style={isOpen ? { backgroundColor: accent } : undefined}
                  />

                  <button
                    type="button"
                    // ✅ toggle: click open item again => collapse
                    onClick={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
                    className={cx(
                      "w-full rounded-3xl border p-4 text-left transition md:p-5",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950",
                      isOpen
                        ? "border-transparent bg-white shadow-sm dark:bg-slate-950/60"
                        : "border-slate-200 bg-white/40 hover:bg-white/70 dark:border-slate-800 dark:bg-slate-950/25 dark:hover:bg-slate-950/40",
                    )}
                    style={isOpen ? { boxShadow: "0 10px 30px rgba(0,0,0,0.06)" } : undefined}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-extrabold" style={{ color: accent }}>
                          {it.year}
                        </div>
                        <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                          {it.title}
                        </div>
                        <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                          {it.summary}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1">
                            Collapse <ChevronUp className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            Expand <ChevronDown className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* tags */}
                    {it.tags && it.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {it.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* details */}
                    <div
                      id={panelId}
                      className={cx(
                        "grid gap-3 overflow-hidden transition-all",
                        isOpen ? "mt-4 max-h-[500px] opacity-100" : "max-h-0 opacity-0",
                      )}
                    >
                      {it.details && it.details.length > 0 && (
                        <ul className="grid gap-2 rounded-2xl border border-slate-200 bg-white/50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                          {it.details.map((d) => (
                            <li key={d} className="flex gap-2">
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: accent }}
                              />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
