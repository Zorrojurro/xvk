"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"

export default function NewExperiencePage() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [location, setLocation] = useState("")
  const [year, setYear] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const canSubmit = useMemo(
    () => name.trim() && title.trim() && content.trim() && !loading,
    [name, title, content, loading]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOk(null)
    setErr(null)
    setLoading(true)

    try {
      // Sanitize to avoid mojibake garbage getting stored in DB
      const safeName = cleanText(name).trim()
      const safeTitle = cleanText(title).trim()
      const safeContent = cleanText(content).trim()
      const safeLocation = cleanText(location).trim()
      const safeYear = cleanText(year).trim()

      let image_url: string | null = null

      // Upload photo (optional)
      if (file) {
        const original = cleanText(file.name).replaceAll(" ", "_")
        const path = `${Date.now()}-${original}`

        const up = await supabase.storage
          .from("experience-photos")
          .upload(path, file, { cacheControl: "3600", upsert: false })

        if (up.error) throw up.error

        const pub = supabase.storage.from("experience-photos").getPublicUrl(path)
        image_url = pub.data.publicUrl
      }

      // Insert story as pending
      const { error } = await supabase.from("experiences").insert({
        name: safeName,
        title: safeTitle,
        content: safeContent,
        location: safeLocation || null,
        year: safeYear || null,
        image_url,
        status: "pending",
      })

      if (error) throw error

      setOk("Submitted! Your story is pending approval and will appear once published.")
      setName("")
      setTitle("")
      setContent("")
      setLocation("")
      setYear("")
      setFile(null)
    } catch (e: any) {
      setErr(e?.message || "Failed to submit.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-xvk-radial">
      <section className="container-x py-12">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-extrabold">Share your experience</h1>
          <p className="mt-2 text-slate-700 dark:text-slate-200">
            Upload a photo + write a short story. Submissions are moderated before publishing.
          </p>

          {ok && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-100">
              {ok}
            </div>
          )}

          {err && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
              {err}
            </div>
          )}

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Your name *</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-[#622599]/60 dark:border-slate-800 dark:bg-slate-950/40"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Title *</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-[#622599]/60 dark:border-slate-800 dark:bg-slate-950/40"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Location</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-[#622599]/60 dark:border-slate-800 dark:bg-slate-950/40"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bengaluru / Camp site / etc."
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Year</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-[#622599]/60 dark:border-slate-800 dark:bg-slate-950/40"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold">Your story *</span>
              <textarea
                className="min-h-[140px] rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-[#622599]/60 dark:border-slate-800 dark:bg-slate-950/40"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold">Photo (optional)</span>
              <input
                type="file"
                accept="image/*"
                className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tip: keep images under ~5MB for faster uploads.
              </span>
            </label>

            <div className="mt-2 flex gap-3">
              <button className="btn-primary" disabled={!canSubmit} type="submit">
                {loading ? "Submitting..." : "Submit"}
              </button>
              <a href="/experiences" className="btn-ghost">
                Back to stories
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
