"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"

type EventRow = {
  id: string
  title: string
  location: string | null
  starts_at: string
  status: "draft" | "published" | "cancelled"
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventRow[]>([])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from("events")
        .select("id,title,location,starts_at,status")
        .eq("status", "published")
        .order("starts_at", { ascending: true })
        .limit(3)

      setEvents((data ?? []) as EventRow[])
    })()
  }, [])

  return (
    <section className="container-x py-12" id="events">
      <div className="card p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Upcoming events</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-200">
              Camps, drives, training sessions and meetups.
            </p>
          </div>
          <Link href="/events" className="btn-primary">View all events</Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {events.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              No upcoming events yet.
            </div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <div className="text-xs font-semibold text-[#622599] dark:text-[#c7a8ff]">
                  {new Date(e.starts_at).toLocaleString()}
                  {e.location ? ` | ${cleanText(e.location)}` : ""}
                </div>
                <div className="mt-2 font-extrabold">{cleanText(e.title)}</div>
                <div className="mt-4">
                  <Link className="btn-ghost" href="/events">RSVP</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
