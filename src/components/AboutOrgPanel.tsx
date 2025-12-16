"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

type OrgStatsRow = {
  id: number
  members: number
  active_volunteers: number
  yearly_camps: number
  service_drives: number
}

type LeaderRow = {
  id: string
  name: string
  role: string
  photo_url: string | null
  sort_order: number
  is_active: boolean
}

const ACCENT = "#622599"

export default function AboutOrgPanel() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OrgStatsRow | null>(null)
  const [leaders, setLeaders] = useState<LeaderRow[]>([])

  const activeLeaders = useMemo(
    () => leaders.filter((l) => l.is_active).sort((a, b) => a.sort_order - b.sort_order).slice(0, 4),
    [leaders],
  )

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)

      const s = await supabase.from("org_stats").select("*").eq("id", 1).maybeSingle()
      const l = await supabase
        .from("leaders")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(4)

      if (!alive) return

      setStats((s.data as OrgStatsRow) ?? null)
      setLeaders((l.data as LeaderRow[]) ?? [])
      setLoading(false)
    })()

    return () => {
      alive = false
    }
  }, [])

  const members = stats?.members ?? 0

  return (
    <div className="space-y-6">
      {/* Strength */}
      <div className="rounded-3xl border border-[#622599]/20 bg-[#622599]/5 p-6">
        <div className="text-xs font-extrabold tracking-wider" style={{ color: ACCENT }}>
          CURRENT STRENGTH
        </div>

        <div className="mt-2 text-4xl font-extrabold text-slate-900">
          {loading ? "..." : `${members}+`}
        </div>
        <div className="mt-1 text-sm text-slate-700">People in the organization</div>

        <div className="mt-6 grid gap-3">
          <StatMini label="Active volunteers" value={stats?.active_volunteers} loading={loading} />
          <StatMini label="Yearly camps" value={stats?.yearly_camps} loading={loading} />
          <StatMini label="Service drives" value={stats?.service_drives} loading={loading} />
        </div>
      </div>

      {/* Leaders */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur">
        <div className="text-xs font-extrabold tracking-wider" style={{ color: ACCENT }}>
          CURRENT LEADERS
        </div>

        <div className="mt-4 grid gap-4">
          {(loading ? Array.from({ length: 4 }) : activeLeaders).map((l: any, idx: number) => (
            <div
              key={l?.id ?? idx}
              className="flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white/40 p-4"
            >
              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-slate-200" />
                ) : (
                  <img
                    src={l.photo_url ?? "/brand/xvksg-logo.png"}
                    alt={l.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="truncate font-extrabold text-slate-900">{loading ? "Loading..." : l.name}</div>
                <div className="text-xs text-slate-600">{loading ? "..." : l.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Link href="/contact" className="btn-primary w-full justify-center">
            Reach the leadership
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatMini({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-extrabold text-slate-900">{loading ? "..." : `${value ?? 0}+`}</div>
    </div>
  )
}
