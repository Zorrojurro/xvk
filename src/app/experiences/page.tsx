"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"

type Experience = {
  id: string
  created_at: string
  name: string
  title: string
  content: string
  image_url: string | null
  location: string | null
  year: string | null
  status: "pending" | "published" | "rejected"
}

export default function ExperiencesPage() {
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("experiences")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })

        if (error) throw error
        if (mounted) setItems((data ?? []) as Experience[])
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load experiences.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const hasItems = useMemo(() => items.length > 0, [items])

  return (
    <main className="min-h-screen bg-xvk-radial">
      <section className="container-x py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Volunteer Experiences</h1>
            <p className="mt-2 text-slate-700 dark:text-slate-200">
              Stories from camps, service drives, and moments that stayed with us.
            </p>
          </div>
          <Link href="/experiences/new" className="btn-primary">
            Share your story
          </Link>
        </div>

        {loading && <div className="mt-8 card p-6 text-slate-700 dark:text-slate-200">Loading...</div>}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
            {cleanText(error)}
          </div>
        )}

        {!loading && !error && !hasItems && (
          <div className="mt-10 card p-6 text-slate-700 dark:text-slate-200">
            No published stories yet. Be the first to submit one.
          </div>
        )}

        {!loading && !error && hasItems && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((x) => {
              const title = cleanText(x.title)
              const name = cleanText(x.name)
              const content = cleanText(x.content)
              const year = cleanText(x.year || "")
              const location = cleanText(x.location || "")
              const img = cleanText(x.image_url || "")

              const meta =
                (year ? year : "") + (location ? ` | ${location}` : "") // ASCII-safe separators

              return (
                <article key={x.id} className="card overflow-hidden">
                  <div className="h-44 w-full bg-slate-100 dark:bg-slate-900">
                    <img
                      src={img || "/placeholder.jpg"}
                      alt={title || "Experience photo"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5">
                    <div className="text-xs font-semibold text-[#622599] dark:text-[#c7a8ff]">
                      {meta || " "}
                    </div>

                    <h2 className="mt-1 text-lg font-extrabold">{title}</h2>

                    <p className="mt-2 max-h-24 overflow-hidden text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {content}
                    </p>

                    <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">- {name}</div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
