"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"

type EventRow = {
  id: string
  created_at: string
  title: string
  description: string
  location: string | null
  starts_at: string
  ends_at: string | null
  status: "draft" | "published" | "cancelled"
  rsvp_count: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openId, setOpenId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [count, setCount] = useState<number>(1)
  const [note, setNote] = useState("")

  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const upcoming = useMemo(() => {
    const now = Date.now()
    // show future published events, sorted soonest first
    return events
      .filter((e) => e.status === "published")
      .filter((e) => {
        const start = new Date(e.starts_at).getTime()
        return Number.isFinite(start) ? start >= now - 6 * 60 * 60 * 1000 : true // allow small grace
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  }, [events])

  async function load() {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true })

      if (error) throw error
      setEvents((data ?? []) as EventRow[])
    } catch (e: any) {
      setError(e?.message || "Failed to load events.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openRsvp(id: string) {
    setOpenId(id)
    setOk(null)
    setErr(null)
    setName("")
    setEmail("")
    setPhone("")
    setCount(1)
    setNote("")
  }

  async function submitRsvp() {
    if (!openId) return
    setOk(null)
    setErr(null)
    setBusy(true)

    try {
      const payload = {
        event_id: openId,
        name: cleanText(name),
        email: cleanText(email) || null,
        phone: cleanText(phone) || null,
        count: 1,
        note: cleanText(note) || null,
      }

      if (!payload.name.trim()) throw new Error("Name is required.")

      const { error } = await supabase.from("event_rsvps").insert(payload)
      if (error) throw error

      setOk("RSVP received. See you at the event.")
      await load()
    } catch (e: any) {
      setErr(e?.message || "Failed to RSVP.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-xvk-radial">
      <section className="container-x py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Events</h1>
            <p className="mt-2 text-slate-700 dark:text-slate-200">
              Upcoming camps, drives, training sessions, and meetups.
            </p>
          </div>

          {/* PUBLIC: no Admin link here */}
          <div className="flex gap-2">
            <Link className="btn-ghost" href="/">Home</Link>
            <button className="btn-ghost" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 card p-6 text-slate-700 dark:text-slate-200">Loading...</div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
            {cleanText(error)}
          </div>
        )}

        {!loading && !error && upcoming.length === 0 && (
          <div className="mt-10 card p-6 text-slate-700 dark:text-slate-200">
            No upcoming events yet. Check back soon.
          </div>
        )}

        {!loading && !error && upcoming.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {upcoming.map((e) => {
              const title = cleanText(e.title)
              const desc = cleanText(e.description)
              const loc = cleanText(e.location || "")
              const starts = new Date(e.starts_at).toLocaleString()
              const ends = e.ends_at ? new Date(e.ends_at).toLocaleString() : ""

              return (
                <article key={e.id} className="card p-6">
                  <div className="text-xs font-semibold text-[#622599] dark:text-[#c7a8ff]">
                    {starts}
                    {ends ? ` | Ends: ${ends}` : ""}
                    {loc ? ` | ${loc}` : ""}
                  </div>

                  <h2 className="mt-2 text-xl font-extrabold">{title}</h2>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{desc}</p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button className="btn-primary" onClick={() => openRsvp(e.id)}>
                      RSVP
                    </button>
                    {openId === e.id ? (
                      <button className="btn-ghost" onClick={() => setOpenId(null)}>
                        Close
                      </button>
                    ) : null}
                  </div>

                  {openId === e.id && (
                    <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="font-semibold">RSVP</div>

                      {ok && (
                        <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-100">
                          {ok}
                        </div>
                      )}

                      {err && (
                        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
                          {cleanText(err)}
                        </div>
                      )}

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="grid gap-2 text-sm">
                          <span className="font-semibold">Name *</span>
                          <input
                            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                            value={name}
                            onChange={(x) => setName(x.target.value)}
                          />
                        </label>

                        <label className="grid gap-2 text-sm">
                          <span className="font-semibold">People count</span>
                          <input
                            type="number"
                            max={1}
                            min={1}
                            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                            value={count}
                            onChange={(x) => setCount(Number(x.target.value))}
                          />
                        </label>

                        <label className="grid gap-2 text-sm">
                          <span className="font-semibold">Email</span>
                          <input
                            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                            value={email}
                            onChange={(x) => setEmail(x.target.value)}
                          />
                        </label>

                        <label className="grid gap-2 text-sm">
                          <span className="font-semibold">Phone</span>
                          <input
                            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                            value={phone}
                            onChange={(x) => setPhone(x.target.value)}
                          />
                        </label>
                      </div>

                      <label className="mt-3 grid gap-2 text-sm">
                        <span className="font-semibold">Note (optional)</span>
                        <textarea
                          className="min-h-[90px] rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                          value={note}
                          onChange={(x) => setNote(x.target.value)}
                        />
                      </label>

                      <div className="mt-4 flex gap-3">
                        <button className="btn-primary" disabled={busy} onClick={submitRsvp}>
                          {busy ? "Submitting..." : "Submit RSVP"}
                        </button>
                        <button className="btn-ghost" onClick={() => setOpenId(null)} disabled={busy}>
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-[#622599]/20 bg-[#622599]/5 p-5 dark:border-[#622599]/30 dark:bg-[#622599]/10">
          <div className="font-semibold text-[#3b175a] dark:text-[#e9ddff]">Want updates?</div>
          <div className="text-sm text-[#3b175a]/80 dark:text-[#e9ddff]/80">
            Check back here, or reach out from the Contact page to join the group broadcast list.
          </div>
          <div className="mt-4 flex gap-3">
            <Link className="btn-primary" href="/contact">Contact us</Link>
            <Link className="btn-ghost" href="/experiences">Read Experiences</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
