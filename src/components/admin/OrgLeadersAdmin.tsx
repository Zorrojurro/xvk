"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"

type OrgStatsRow = {
  id: string
  member_count: number
}

type LeaderRow = {
  id: string
  name: string
  role: string
  photo_url: string | null
  sort_order: number
}

const BUCKET = process.env.NEXT_PUBLIC_LEADERS_BUCKET || "leaders"

function uid() {
  // browser-safe uuid (works in modern browsers + Vercel runtime)
  const c = globalThis.crypto as Crypto | undefined
  if (c && "randomUUID" in c && typeof (c as any).randomUUID === "function") {
    return (c as any).randomUUID() as string
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`
}


function asInt(n: unknown, fallback = 0) {
  const x = Number(n)
  if (!Number.isFinite(x)) return fallback
  return Math.max(0, Math.floor(x))
}

export default function OrgLeadersAdmin() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [statsRow, setStatsRow] = useState<OrgStatsRow | null>(null)
  const [memberCount, setMemberCount] = useState<number>(0)

  const [leaders, setLeaders] = useState<LeaderRow[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  // store per-leader file inputs (so we can reset input.value without touching event pooling)
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({})

  async function loadAll() {
    setErr(null)
    setOk(null)
    setLoading(true)
    try {
      const statsRes = await supabase.from("org_stats").select("id,member_count").limit(1)
      if (statsRes.error) throw statsRes.error
      const s = (statsRes.data?.[0] as OrgStatsRow | undefined) ?? null
      setStatsRow(s)
      setMemberCount(typeof s?.member_count === "number" ? s.member_count : 0)

      const leadersRes = await supabase
        .from("leaders")
        .select("id,name,role,photo_url,sort_order")
        .order("sort_order", { ascending: true })

      if (leadersRes.error) throw leadersRes.error
      setLeaders((leadersRes.data ?? []) as LeaderRow[])
    } catch (e: any) {
      setErr(e?.message || "Failed to load org/leaders.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveOrgStats() {
    setErr(null)
    setOk(null)
    setLoading(true)
    try {
      const payload = { member_count: asInt(memberCount, 0) }

      if (statsRow?.id) {
        const { error } = await supabase.from("org_stats").update(payload).eq("id", statsRow.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from("org_stats").insert(payload).select("id,member_count").single()
        if (error) throw error
        setStatsRow(data as OrgStatsRow)
      }

      setOk("Strength updated.")
      // update locally (no full reload needed)
      setStatsRow((cur) => (cur ? { ...cur, member_count: payload.member_count } : cur))
    } catch (e: any) {
      setErr(e?.message || "Failed to save strength.")
    } finally {
      setLoading(false)
    }
  }

  const leadersSorted = useMemo(() => {
    return [...leaders].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [leaders])

  async function addLeader(prefill?: Partial<LeaderRow>) {
    setErr(null)
    setOk(null)
    setLoading(true)
    try {
      const nextOrder = leadersSorted.length
        ? Math.max(...leadersSorted.map((l) => Number(l.sort_order) || 1)) + 1
        : 1

      const payload = {
        name: cleanText(prefill?.name || ""),
        role: cleanText(prefill?.role || ""),
        photo_url: prefill?.photo_url ?? null,
        sort_order: typeof prefill?.sort_order === "number" ? Math.max(1, Math.floor(prefill.sort_order)) : nextOrder,
      }

      const { data, error } = await supabase.from("leaders").insert(payload).select("id,name,role,photo_url,sort_order").single()
      if (error) throw error

      setLeaders((prev) => [...prev, data as LeaderRow])
      setOk("Leader added.")
    } catch (e: any) {
      setErr(e?.message || "Failed to add leader.")
    } finally {
      setLoading(false)
    }
  }

  async function saveLeader(id: string) {
    const row = leaders.find((l) => l.id === id)
    if (!row) return

    setErr(null)
    setOk(null)
    setSavingId(id)
    try {
      const payload = {
        name: cleanText(row.name || ""),
        role: cleanText(row.role || ""),
        sort_order: Math.max(1, Math.floor(Number(row.sort_order) || 1)),
        photo_url: row.photo_url ?? null,
      }

      const { error } = await supabase.from("leaders").update(payload).eq("id", id)
      if (error) throw error

      setOk("Leader saved.")
      setLeaders((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)))
    } catch (e: any) {
      setErr(e?.message || "Failed to save leader.")
    } finally {
      setSavingId(null)
    }
  }

  async function deleteLeader(id: string) {
    const yes = confirm("Delete this leader?")
    if (!yes) return

    setErr(null)
    setOk(null)
    setSavingId(id)
    try {
      const { error } = await supabase.from("leaders").delete().eq("id", id)
      if (error) throw error
      setLeaders((prev) => prev.filter((l) => l.id !== id))
      setOk("Leader deleted.")
    } catch (e: any) {
      setErr(e?.message || "Failed to delete leader.")
    } finally {
      setSavingId(null)
    }
  }

  async function setLeaderPhoto(leaderId: string, photoUrl: string | null) {
    const { error } = await supabase.from("leaders").update({ photo_url: photoUrl }).eq("id", leaderId)
    if (error) throw error
    setLeaders((prev) => prev.map((l) => (l.id === leaderId ? { ...l, photo_url: photoUrl } : l)))
  }

  async function uploadPhoto(leaderId: string, file: File) {
    setErr(null)
    setOk(null)
    setUploadingId(leaderId)
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
      const path = `leaders/${leaderId}/${Date.now()}_${uid()}.${ext}`

      const up = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type || "image/*",
        cacheControl: "3600",
      })
      if (up.error) throw up.error

      const pub = supabase.storage.from(BUCKET).getPublicUrl(path)
      const publicUrl = pub.data?.publicUrl
      if (!publicUrl) throw new Error("Upload succeeded but could not get public URL. Make bucket public or use signed URLs.")

      // cache-bust so it reflects instantly everywhere
      const busted = `${publicUrl}?v=${Date.now()}`

      await setLeaderPhoto(leaderId, busted)
      setOk("Photo uploaded.")
    } catch (e: any) {
      setErr(e?.message || "Failed to upload photo.")
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div className="grid gap-4">
      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {cleanText(err)}
        </div>
      )}
      {ok && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          {cleanText(ok)}
        </div>
      )}

      {/* Strength */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold">Current strength</div>
            <div className="text-xs text-slate-600">Shown on the public homepage.</div>
          </div>
          <button className="btn-ghost" disabled={loading} onClick={loadAll}>
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">People</span>
            <input
              type="number"
              min={0}
              className="w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2"
              value={Number.isFinite(memberCount) ? memberCount : 0}
              onChange={(e) => setMemberCount(parseInt(e.target.value || "0", 10))}
            />
          </label>

          <button className="btn-primary" disabled={loading} onClick={saveOrgStats}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Leaders */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold">Leaders</div>
            <div className="text-xs text-slate-600">Only leaders you create will show on the homepage.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" disabled={loading} onClick={() => addLeader()}>
              + Add leader
            </button>
            <button
              className="btn-ghost"
              disabled={loading}
              onClick={async () => {
                if (leaders.length) return setOk("Leaders already exist. Use + Add leader.")
                await addLeader({ role: "President", sort_order: 1 })
                await addLeader({ role: "Secretary", sort_order: 2 })
                await addLeader({ role: "Treasurer", sort_order: 3 })
                await addLeader({ role: "Scout Master", sort_order: 4 })
              }}
            >
              Create 4 positions
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {leadersSorted.map((l) => {
            const busy = savingId === l.id || uploadingId === l.id
            return (
              <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {l.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cleanText(l.photo_url)} alt="leader" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] text-slate-500">No photo</div>
                      )}
                    </div>

                    <div className="grid min-w-0 gap-2 md:grid-cols-3 md:items-end">
                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Name</span>
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                          value={l.name ?? ""}
                          onChange={(e) =>
                            setLeaders((prev) => prev.map((x) => (x.id === l.id ? { ...x, name: e.target.value } : x)))
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Role</span>
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                          value={l.role ?? ""}
                          onChange={(e) =>
                            setLeaders((prev) => prev.map((x) => (x.id === l.id ? { ...x, role: e.target.value } : x)))
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="font-semibold">Order</span>
                        <input
                          type="number"
                          min={1}
                          className="w-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2"
                          value={Number.isFinite(l.sort_order) ? l.sort_order : 1}
                          onChange={(e) =>
                            setLeaders((prev) =>
                              prev.map((x) => (x.id === l.id ? { ...x, sort_order: parseInt(e.target.value || "1", 10) } : x)),
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={(el) => {
                        fileInputsRef.current[l.id] = el
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`leader-photo-${l.id}`}
                      disabled={busy}
                      onChange={async (e) => {
                        const input = e.currentTarget as HTMLInputElement
                        const file = input.files?.[0] ?? null
                        input.value = ""
                        if (!file) return
                        await uploadPhoto(l.id, file)
                      }}
                    />

                    <label className={`btn-ghost cursor-pointer ${busy ? "opacity-50 pointer-events-none" : ""}`} htmlFor={`leader-photo-${l.id}`}>
                      {uploadingId === l.id ? "Uploading..." : "Upload photo"}
                    </label>

                    <button
                      className="btn-ghost"
                      disabled={busy || !l.photo_url}
                      onClick={async () => {
                        try {
                          setUploadingId(l.id)
                          await setLeaderPhoto(l.id, null)
                          setOk("Photo removed.")
                        } catch (e: any) {
                          setErr(e?.message || "Failed to remove photo.")
                        } finally {
                          setUploadingId(null)
                        }
                      }}
                    >
                      Remove photo
                    </button>

                    <button className="btn-primary" disabled={busy} onClick={() => saveLeader(l.id)}>
                      {savingId === l.id ? "Saving..." : "Save"}
                    </button>

                    <button className="btn-ghost" disabled={busy} onClick={() => deleteLeader(l.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {l.photo_url && (
                  <div className="mt-3 text-xs text-slate-500 break-all">
                    Photo URL: <span className="font-mono">{cleanText(l.photo_url)}</span>
                  </div>
                )}
              </div>
            )
          })}

          {leadersSorted.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No leaders yet. Click <span className="font-semibold">Create 4 positions</span> or{" "}
              <span className="font-semibold">+ Add leader</span>.
            </div>
          )}

          <div className="mt-2 text-[11px] text-slate-500">
            Storage bucket: <span className="font-mono">{BUCKET}</span> (must be public or you need signed URLs)
          </div>
        </div>
      </div>
    </div>
  )
}
