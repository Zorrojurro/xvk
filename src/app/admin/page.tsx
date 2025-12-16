// xvk-kanteerava/src/app/admin/page.tsx
"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"
import OrgLeadersAdmin from "@/components/admin/OrgLeadersAdmin"

type View = "overview" | "stories" | "events" | "contacts"

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

type ContactMsg = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  message: string
}

type EventRow = {
  id: string
  created_at: string
  title: string
  description: string
  location: string | null
  starts_at: string
  ends_at: string | null
  status: "draft" | "published" | "cancelled"
  rsvp_count?: number | null
}

type RsvpRow = {
  id: string
  created_at: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  count: number | null
  note: string | null
}

function toIsoFromLocal(dtLocal: string) {
  if (!dtLocal) return null
  const d = new Date(dtLocal)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function isoToLocalInput(iso: string) {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function csvEscape(v: any) {
  const s = v === undefined || v === null ? "" : String(v)
  const needs = /[",\n\r]/.test(s)
  const escaped = s.replace(/"/g, '""')
  return needs ? `"${escaped}"` : escaped
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [adminCheckErr, setAdminCheckErr] = useState<string | null>(null)

  const [view, setView] = useState<View>("overview")

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  // Auth form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Data
  const [stories, setStories] = useState<Experience[]>([])
  const [contacts, setContacts] = useState<ContactMsg[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [rsvps, setRsvps] = useState<RsvpRow[]>([])

  // Selections
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Filters
  const [storyStatus, setStoryStatus] = useState<"all" | Experience["status"]>("pending")
  const [q, setQ] = useState("")

  // Event form
  const [evId, setEvId] = useState<string | null>(null)
  const [evTitle, setEvTitle] = useState("")
  const [evDesc, setEvDesc] = useState("")
  const [evLocation, setEvLocation] = useState("")
  const [evStartsLocal, setEvStartsLocal] = useState("")
  const [evEndsLocal, setEvEndsLocal] = useState("")
  const [evStatus, setEvStatus] = useState<EventRow["status"]>("published")

  // SESSION
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // ADMIN CHECK (admins table only)
  async function checkAdmin() {
    setIsAdmin(null)
    setAdminCheckErr(null)
    try {
      const { data, error } = await supabase.from("admins").select("user_id").maybeSingle()
      if (error) {
        setAdminCheckErr(error.message)
        setIsAdmin(false)
        return
      }
      setIsAdmin(!!data)
    } catch (e: any) {
      setAdminCheckErr(e?.message || "Admin check failed.")
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) {
      setIsAdmin(null)
      setAdminCheckErr(null)
      return
    }
    checkAdmin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const authed = !!session
  const allowed = authed && isAdmin === true

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    setOk(null)
    setAdminCheckErr(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setStories([])
    setContacts([])
    setEvents([])
    setRsvps([])
    setSelectedStoryId(null)
    setSelectedContactId(null)
    setSelectedEventId(null)
    resetEventForm()
    setAdminCheckErr(null)
  }

  function resetEventForm() {
    setEvId(null)
    setEvTitle("")
    setEvDesc("")
    setEvLocation("")
    setEvStartsLocal("")
    setEvEndsLocal("")
    setEvStatus("published")
  }

  function fillEventForm(e: EventRow) {
    setEvId(e.id)
    setEvTitle(e.title || "")
    setEvDesc(e.description || "")
    setEvLocation(e.location || "")
    setEvStartsLocal(e.starts_at ? isoToLocalInput(e.starts_at) : "")
    setEvEndsLocal(e.ends_at ? isoToLocalInput(e.ends_at) : "")
    setEvStatus(e.status)
  }

  async function loadStories() {
    const { data, error } = await supabase.from("experiences").select("*").order("created_at", { ascending: false })
    if (error) throw error
    setStories((data ?? []) as Experience[])
  }

  async function loadContacts() {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })
    if (error) throw error
    setContacts((data ?? []) as ContactMsg[])
  }

  async function loadEvents() {
    const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true })
    if (error) throw error
    setEvents((data ?? []) as EventRow[])
  }

  async function loadRsvps(eventId: string) {
    const { data, error } = await supabase
      .from("event_rsvps")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
    if (error) throw error
    setRsvps((data ?? []) as RsvpRow[])
  }

  useEffect(() => {
    if (!allowed) return
    ;(async () => {
      try {
        setErr(null)
        setOk(null)
        setLoading(true)
        await Promise.all([loadStories(), loadContacts(), loadEvents()])
      } catch (e: any) {
        setErr(e?.message || "Failed to load admin data.")
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed])

  async function setStory(id: string, status: Experience["status"]) {
    setErr(null)
    setOk(null)
    setLoading(true)
    const { error } = await supabase.from("experiences").update({ status }).eq("id", id)
    setLoading(false)
    if (error) return setErr(error.message)
    setOk(`Story set to ${status}.`)
    await loadStories()
  }

  async function rejectAndDeleteStory(id: string) {
    const yes = confirm("Reject + permanently delete this story?")
    if (!yes) return
    setErr(null)
    setOk(null)
    setLoading(true)
    const del = await supabase.from("experiences").delete().eq("id", id)
    setLoading(false)
    if (del.error) return setErr(del.error.message)
    setOk("Story deleted.")
    if (selectedStoryId === id) setSelectedStoryId(null)
    await loadStories()
  }

  async function deleteContact(id: string) {
    const yes = confirm("Delete this contact message?")
    if (!yes) return
    setErr(null)
    setOk(null)
    setLoading(true)
    const { error } = await supabase.from("contact_messages").delete().eq("id", id)
    setLoading(false)
    if (error) return setErr(error.message)
    setOk("Message deleted.")
    if (selectedContactId === id) setSelectedContactId(null)
    await loadContacts()
  }

  async function saveEvent() {
    setErr(null)
    setOk(null)
    setLoading(true)
    try {
      const startsIso = toIsoFromLocal(evStartsLocal)
      const endsIso = toIsoFromLocal(evEndsLocal)

      if (!cleanText(evTitle).trim()) throw new Error("Title is required.")
      if (!cleanText(evDesc).trim()) throw new Error("Description is required.")
      if (!startsIso) throw new Error("Start date/time is required.")

      const payload = {
        title: cleanText(evTitle),
        description: cleanText(evDesc),
        location: cleanText(evLocation) || null,
        starts_at: startsIso,
        ends_at: endsIso,
        status: evStatus,
      }

      if (evId) {
        const { error } = await supabase.from("events").update(payload).eq("id", evId)
        if (error) throw error
        setOk("Event updated.")
      } else {
        const { error } = await supabase.from("events").insert(payload)
        if (error) throw error
        setOk("Event created.")
      }

      resetEventForm()
      await loadEvents()
    } catch (e: any) {
      setErr(e?.message || "Failed to save event.")
    } finally {
      setLoading(false)
    }
  }

  async function deleteEvent(id: string) {
    const yes = confirm("Delete this event?")
    if (!yes) return
    setErr(null)
    setOk(null)
    setLoading(true)
    const { error } = await supabase.from("events").delete().eq("id", id)
    setLoading(false)
    if (error) return setErr(error.message)
    setOk("Event deleted.")
    if (selectedEventId === id) {
      setSelectedEventId(null)
      setRsvps([])
    }
    await loadEvents()
  }

  async function setEventStatus(id: string, status: EventRow["status"]) {
    setErr(null)
    setOk(null)
    setLoading(true)
    const { error } = await supabase.from("events").update({ status }).eq("id", id)
    setLoading(false)
    if (error) return setErr(error.message)
    setOk(`Event status: ${status}.`)
    await loadEvents()
  }

  const filteredStories = useMemo(() => {
    const qq = cleanText(q).toLowerCase()
    return stories
      .filter((s) => (storyStatus === "all" ? true : s.status === storyStatus))
      .filter((s) => {
        if (!qq) return true
        return (
          cleanText(s.title).toLowerCase().includes(qq) ||
          cleanText(s.name).toLowerCase().includes(qq) ||
          cleanText(s.content).toLowerCase().includes(qq)
        )
      })
  }, [stories, storyStatus, q])

  const selectedStory = useMemo(
    () => filteredStories.find((s) => s.id === selectedStoryId) || null,
    [filteredStories, selectedStoryId],
  )
  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) || null,
    [contacts, selectedContactId],
  )
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId],
  )

  // LOGIN
  if (!authed) {
    return (
      <main className="min-h-screen bg-xvk-radial">
        <section className="container-x py-12">
          <div className="card max-w-xl p-6 md:p-8">
            <h1 className="text-3xl font-extrabold">Admin</h1>
            <p className="mt-2 text-slate-700">Sign in to manage leaders, strength, stories, events and contacts.</p>

            {err && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                {cleanText(err)}
              </div>
            )}

            <form className="mt-6 grid gap-4" onSubmit={signIn}>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Email</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Password</span>
                <input
                  type="password"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <button className="btn-primary" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </section>
      </main>
    )
  }

  // CHECKING ADMIN
  if (isAdmin === null) {
    return (
      <main className="min-h-screen bg-xvk-radial">
        <section className="container-x py-12">
          <div className="card p-6 text-slate-700">Checking admin access...</div>
        </section>
      </main>
    )
  }

  // NOT ADMIN
  if (isAdmin === false) {
    const uid = session?.user?.id ? String(session.user.id) : ""
    const mail = session?.user?.email ? String(session.user.email) : ""
    return (
      <main className="min-h-screen bg-xvk-radial">
        <section className="container-x py-12">
          <div className="card max-w-2xl p-6 md:p-8">
            <h1 className="text-3xl font-extrabold">Not authorized</h1>
            <p className="mt-2 text-slate-700">This account is not an admin.</p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm">
              <div className="font-semibold">Your signed-in account</div>
              <div className="mt-2 grid gap-2">
                <div>
                  <div className="text-xs text-slate-500">UID (auth.users id)</div>
                  <div className="font-mono text-xs break-all">{uid}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="font-mono text-xs break-all">{mail}</div>
                </div>
              </div>
            </div>

            {adminCheckErr && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Admin check details: {cleanText(adminCheckErr)}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={signOut}>
                Sign out
              </button>
              <a className="btn-ghost" href="/">
                Go to site
              </a>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // ADMIN UI
  return (
    <main className="min-h-screen bg-xvk-radial">
      <section className="container-x py-8">
        <div className="card p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#622599]">XV Kanteerava</div>
              <h1 className="text-2xl font-extrabold md:text-3xl">Admin Console</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <a className="btn-ghost" href="/" target="_blank" rel="noreferrer">
                Open site
              </a>
              <a className="btn-ghost" href="/events" target="_blank" rel="noreferrer">
                Open events
              </a>
              <button className="btn-primary" onClick={signOut}>
                Logout
              </button>
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              {cleanText(err)}
            </div>
          )}
          {ok && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              {cleanText(ok)}
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-[280px,1fr]">
            {/* SIDEBAR */}
            <aside className="rounded-2xl border border-slate-200 bg-white/60 p-3">
              <div className="grid gap-2">
                <button
                  className={`btn-ghost justify-start ${view === "overview" ? "text-[#622599]" : ""}`}
                  onClick={() => setView("overview")}
                >
                  Overview
                </button>
                <button
                  className={`btn-ghost justify-start ${view === "stories" ? "text-[#622599]" : ""}`}
                  onClick={() => setView("stories")}
                >
                  Stories
                </button>
                <button
                  className={`btn-ghost justify-start ${view === "events" ? "text-[#622599]" : ""}`}
                  onClick={() => setView("events")}
                >
                  Events
                </button>
                <button
                  className={`btn-ghost justify-start ${view === "contacts" ? "text-[#622599]" : ""}`}
                  onClick={() => setView("contacts")}
                >
                  Contacts
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-[#622599]/20 bg-[#622599]/5 p-3 text-sm text-[#3b175a]">
                Tip: Keep admin open in one tab. Public site in another.
              </div>
            </aside>

            {/* MAIN */}
            <div className="min-w-0">
              {/* OVERVIEW */}
              {view === "overview" && (
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="font-extrabold">Org and Leaders</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Manage strength + leaders. This should reflect on the homepage.
                    </div>
                  </div>

                  <OrgLeadersAdmin />
                </div>
              )}

              {/* STORIES */}
              {view === "stories" && (
                <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-extrabold">Stories</div>
                      <button
                        className="btn-ghost"
                        disabled={loading}
                        onClick={async () => {
                          try {
                            setLoading(true)
                            await loadStories()
                          } catch (e: any) {
                            setErr(e?.message || "Failed to refresh stories.")
                          } finally {
                            setLoading(false)
                          }
                        }}
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      <label className="grid gap-1 text-xs">
                        <span className="font-semibold">Status</span>
                        <select
                          className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                          value={storyStatus}
                          onChange={(e) => setStoryStatus(e.target.value as any)}
                        >
                          <option value="pending">pending</option>
                          <option value="published">published</option>
                          <option value="rejected">rejected</option>
                          <option value="all">all</option>
                        </select>
                      </label>

                      <label className="md:col-span-2 grid gap-1 text-xs">
                        <span className="font-semibold">Search</span>
                        <input
                          className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="title / name / content"
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {filteredStories.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStoryId(s.id)}
                          className={`text-left rounded-2xl border p-3 transition ${
                            selectedStoryId === s.id
                              ? "border-[#622599]/40 bg-[#622599]/5"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#622599]">
                            {s.status.toUpperCase()} | {new Date(s.created_at).toLocaleString()}
                          </div>
                          <div className="mt-1 font-extrabold">{cleanText(s.title)}</div>
                          <div className="text-sm text-slate-600">{cleanText(s.name)}</div>
                        </button>
                      ))}
                      {filteredStories.length === 0 && <div className="text-sm text-slate-600">No stories match.</div>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="font-extrabold">Details</div>
                    {!selectedStory && <div className="mt-3 text-sm text-slate-600">Select a story to review.</div>}

                    {selectedStory && (
                      <>
                        <div className="mt-3 text-xs text-slate-500">
                          {new Date(selectedStory.created_at).toLocaleString()}
                          {selectedStory.location ? ` | ${cleanText(selectedStory.location)}` : ""}
                          {selectedStory.year ? ` | ${cleanText(selectedStory.year)}` : ""}
                        </div>

                        <div className="mt-2 text-xl font-extrabold">{cleanText(selectedStory.title)}</div>
                        <div className="mt-1 text-sm text-slate-600">- {cleanText(selectedStory.name)}</div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="btn-primary" disabled={loading} onClick={() => setStory(selectedStory.id, "published")}>
                            Approve
                          </button>
                          <button className="btn-ghost" disabled={loading} onClick={() => setStory(selectedStory.id, "pending")}>
                            Set pending
                          </button>
                          <button className="btn-ghost" disabled={loading} onClick={() => rejectAndDeleteStory(selectedStory.id)}>
                            Reject + Delete
                          </button>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{cleanText(selectedStory.content)}</p>

                        {selectedStory.image_url && (
                          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={cleanText(selectedStory.image_url)} alt="story" className="max-h-[420px] w-full object-cover" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* EVENTS */}
              {view === "events" && (
                <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-extrabold">Events</div>
                      <div className="flex gap-2">
                        <button className="btn-ghost" onClick={resetEventForm}>New</button>
                        <button className="btn-ghost" disabled={loading} onClick={loadEvents}>Refresh</button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {events.map((e) => {
                        const count = Number((e as any)?.rsvp_count ?? 0)
                        return (
                          <button
                            key={e.id}
                            onClick={async () => {
                              setSelectedEventId(e.id)
                              fillEventForm(e)
                              try {
                                setLoading(true)
                                await loadRsvps(e.id)
                              } catch (x: any) {
                                setErr(x?.message || "Failed to load RSVPs.")
                              } finally {
                                setLoading(false)
                              }
                            }}
                            className={`text-left rounded-2xl border p-3 transition ${
                              selectedEventId === e.id ? "border-[#622599]/40 bg-[#622599]/5" : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="text-xs font-semibold text-[#622599]">
                              {new Date(e.starts_at).toLocaleString()}
                              {e.location ? ` | ${cleanText(e.location)}` : ""}
                              {" | "}
                              {e.status.toUpperCase()}
                            </div>
                            <div className="mt-1 font-extrabold">{cleanText(e.title)}</div>
                            <div className="text-sm text-slate-600">RSVPs: {Number.isFinite(count) ? count : 0}</div>
                          </button>
                        )
                      })}
                      {events.length === 0 && <div className="text-sm text-slate-600">No events yet.</div>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-extrabold">{evId ? "Edit event" : "Create event"}</div>
                      {evId && (
                        <button className="btn-ghost" disabled={loading} onClick={() => deleteEvent(evId)}>
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3">
                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Title *</span>
                        <input className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Location</span>
                        <input className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2" value={evLocation} onChange={(e) => setEvLocation(e.target.value)} />
                      </label>

                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1 text-sm">
                          <span className="font-semibold">Starts *</span>
                          <input type="datetime-local" className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2" value={evStartsLocal} onChange={(e) => setEvStartsLocal(e.target.value)} />
                        </label>

                        <label className="grid gap-1 text-sm">
                          <span className="font-semibold">Ends</span>
                          <input type="datetime-local" className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2" value={evEndsLocal} onChange={(e) => setEvEndsLocal(e.target.value)} />
                        </label>
                      </div>

                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Description *</span>
                        <textarea className="min-h-[120px] rounded-xl border border-slate-200 bg-white/70 px-3 py-2" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Status</span>
                        <select className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2" value={evStatus} onChange={(e) => setEvStatus(e.target.value as any)}>
                          <option value="published">published</option>
                          <option value="draft">draft</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </label>

                      <button className="btn-primary" disabled={loading} onClick={saveEvent}>
                        {loading ? "Saving..." : evId ? "Update event" : "Create event"}
                      </button>

                      {selectedEvent && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-extrabold">RSVPs</div>
                              <div className="mt-1 text-sm text-slate-600">Total RSVPs: {rsvps.length}</div>
                            </div>

                            <button
                              className="btn-ghost"
                              disabled={!rsvps.length}
                              onClick={() => {
                                const rows = rsvps.map((r) => ({
                                  created_at: new Date(r.created_at).toISOString(),
                                  name: cleanText(r.name),
                                  email: cleanText(r.email || ""),
                                  phone: cleanText(r.phone || ""),
                                  note: cleanText(r.note || ""),
                                  count: r.count ?? 1,
                                }))
                                downloadCsv(`event_${selectedEvent.id}_rsvps.csv`, rows)
                              }}
                            >
                              Download CSV
                            </button>
                          </div>

                          <div className="mt-3 overflow-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="min-w-[700px] w-full text-left text-sm">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Time</th>
                                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Name</th>
                                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Contact</th>
                                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Note</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rsvps.length === 0 && (
                                  <tr>
                                    <td className="px-3 py-3 text-slate-600" colSpan={4}>
                                      No RSVPs yet.
                                    </td>
                                  </tr>
                                )}
                                {rsvps.map((r) => (
                                  <tr key={r.id} className="border-t border-slate-100">
                                    <td className="px-3 py-2 text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                                    <td className="px-3 py-2 font-semibold">{cleanText(r.name)}</td>
                                    <td className="px-3 py-2 text-slate-600">
                                      {r.email ? cleanText(r.email) : "—"}
                                      {r.phone ? ` | ${cleanText(r.phone)}` : ""}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-pre-wrap">{r.note ? cleanText(r.note) : ""}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACTS */}
              {view === "contacts" && (
                <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-extrabold">Contact messages</div>
                      <button className="btn-ghost" disabled={loading} onClick={loadContacts}>Refresh</button>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {contacts.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedContactId(c.id)}
                          className={`text-left rounded-2xl border p-3 transition ${
                            selectedContactId === c.id ? "border-[#622599]/40 bg-[#622599]/5" : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</div>
                          <div className="mt-1 font-extrabold">{cleanText(c.name)}</div>
                          <div className="text-sm text-slate-600">{cleanText(c.email)}</div>
                        </button>
                      ))}
                      {contacts.length === 0 && <div className="text-sm text-slate-600">No messages yet.</div>}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                    <div className="font-extrabold">Details</div>
                    {!selectedContact && <div className="mt-3 text-sm text-slate-600">Select a message to view.</div>}

                    {selectedContact && (
                      <>
                        <div className="mt-3 text-xs text-slate-500">{new Date(selectedContact.created_at).toLocaleString()}</div>

                        <div className="mt-2 text-xl font-extrabold">{cleanText(selectedContact.name)}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          {cleanText(selectedContact.email)}
                          {selectedContact.phone ? ` | ${cleanText(selectedContact.phone)}` : ""}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button className="btn-ghost" disabled={loading} onClick={() => deleteContact(selectedContact.id)}>
                            Delete
                          </button>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{cleanText(selectedContact.message)}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Admin auth source: <span className="font-mono">public.admins</span>
          </div>
        </div>
      </section>
    </main>
  )
}
