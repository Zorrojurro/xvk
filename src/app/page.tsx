"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { cleanText } from "@/lib/utils"
import UpcomingEvents from "@/components/UpcomingEvents"
import {
  Camera,
  Users,
  HeartHandshake,
  TentTree,
  ShieldCheck,
  ChevronDown,
  CalendarDays,
  Sparkles,
} from "lucide-react"

type LeaderRow = {
  id: string
  name: string
  role: string
  photo_url: string | null
  sort_order?: number | null
}

const highlights = [
  {
    icon: Users,
    title: "Open Scout Unit",
    desc: "Anyone with interest can join - students, professionals, alumni, and first-time volunteers.",
  },
  {
    icon: HeartHandshake,
    title: "Service First",
    desc: "Cleanliness drives, disaster support, blood donation, awareness campaigns, and local outreach.",
  },
  {
    icon: TentTree,
    title: "Camps & Skills",
    desc: "Outdoor camps, first-aid, navigation, teamwork, leadership, and real-world readiness.",
  },
  {
    icon: ShieldCheck,
    title: "Values & Discipline",
    desc: "A safe, respectful culture built on the Scout Promise and Law - learn by doing.",
  },
]

const history = [
  {
    id: "1950",
    year: "1950",
    title: "Founded",
    desc: "XV Kanteerava begins its journey of community service and youth development.",
    details:
      "Started as a service-driven unit with discipline, outdoor learning, and leadership through action at the core.",
  },
  {
    id: "growth",
    year: "1970-2000",
    title: "Growth era",
    desc: "Camps, service programs, and leadership activities expand across the community.",
    details:
      "More drives, bigger camps, stronger training - and a culture where seniors mentor juniors consistently.",
  },
  {
    id: "today",
    year: "2000-Today",
    title: "Open unit spirit",
    desc: "More inclusive, volunteer-driven, impact-focused - anyone can contribute.",
    details:
      "An open unit today means: if you want to serve and grow, you are welcome. We guide you step-by-step.",
  },
]

const work = [
  { title: "Community Service", points: ["Clean-up drives", "Blood donation support", "Awareness campaigns"] },
  { title: "Emergency Support", points: ["Volunteer coordination", "Relief distribution", "On-ground help when needed"] },
  { title: "Training & Leadership", points: ["First-aid basics", "Team leadership", "Event organization"] },
]

const wings = [
  {
    title: "Cubs & Bulbuls",
    motto: "Do Your Best",
    boys: "Cubs - boys, ages 5 to 10",
    girls: "Bulbuls - girls, ages 5 to 10",
    note: "Foundation years: habits, confidence, teamwork, and good values.",
  },
  {
    title: "Scouts & Guides",
    motto: "Be Prepared",
    boys: "Scouts - boys, ages 10 to 17",
    girls: "Guides - girls, ages 10 to 17",
    note: "Skill years: camps, leadership, discipline, service projects, real responsibility.",
  },
  {
    title: "Rovers & Rangers",
    motto: "Service",
    boys: "Rovers - boys, ages 17 to 25",
    girls: "Rangers - girls, ages 17 to 25",
    note: "Impact years: leading teams, running events, mentoring juniors, community building.",
  },
]

function asNumber(v: any): number | null {
  if (v === undefined || v === null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function HomePage() {
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null)
  const [leaders, setLeaders] = useState<LeaderRow[]>([])
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          // ✅ Correct tables: org_stats + leaders
          // org_stats: expect single row (or just take the first row)
          const { data: statsRows, error: statsErr } = await supabase.from("org_stats").select("*").limit(1)
          if (!statsErr) {
            const stats = statsRows?.[0] ?? null

            // memberCount: support multiple possible column names
            const mc =
              asNumber((stats as any)?.member_count) ??
              asNumber((stats as any)?.strength) ??
              asNumber((stats as any)?.current_strength)

            // volunteerCount: support multiple possible column names
            const vc =
              asNumber((stats as any)?.volunteer_count) ??
              asNumber((stats as any)?.volunteers) ??
              asNumber((stats as any)?.volunteers_count)

            if (alive) {
              if (mc !== null) setMemberCount(mc)
              if (vc !== null) setVolunteerCount(vc)
            }
          }

          const { data: ls, error: leadersErr } = await supabase
            .from("leaders")
            .select("id,name,role,photo_url,sort_order")
            .order("sort_order", { ascending: true })

          if (!leadersErr && alive) setLeaders((ls ?? []) as LeaderRow[])
        } catch {
          // keep page rendering even if DB not ready
        }
      })()

    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-xvk-radial relative">
      {/* HERO */}
      <section className="container-x py-14 md:py-20">
        <div className="card p-7 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#622599]/20 bg-white/70 px-3 py-1 text-xs font-semibold text-[#622599]">
              <span className="h-2 w-2 rounded-full bg-[#622599]" />
              Since 1950 {"\u2022"} Open Scout Unit
            </div>

            <div className="text-xs text-slate-600">
              Join us {"\u2022"} Volunteers {"\u2022"} Service projects {"\u2022"} Camps {"\u2022"} Leadership {"\u2022"} Community impact
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr,0.65fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                XV Kanteerava
                <span className="block text-[#622599]">A community that builds better people.</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                Scouting is about community. It shapes character, builds confidence, and trains real-life skills through
                service and leadership. Whether you are a kid starting out or a volunteer stepping in, you grow with us
                and help make the world better.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">
                  Join / Volunteer
                </Link>
                <Link href="/events" className="btn-ghost inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Events
                </Link>
                <Link href="/experiences" className="btn-ghost">
                  Experiences
                </Link>
                <Link href="/experiences/new" className="btn-ghost inline-flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Share a Story
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="text-xs text-slate-500">Years</div>
                  <div className="text-2xl font-extrabold text-[#622599]">75+</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="text-xs text-slate-500">Focus</div>
                  <div className="text-2xl font-extrabold">Service</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="text-xs text-slate-500">Culture</div>
                  <div className="text-2xl font-extrabold">Discipline</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="text-xs text-slate-500">Community</div>
                  <div className="text-2xl font-extrabold">Open</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-[#622599]" />
                What you'll gain
              </div>
              <ul className="mt-4 grid gap-2 text-sm text-slate-700">
                <li>- Real service work that matters</li>
                <li>- Confidence, leadership, teamwork</li>
                <li>- Camps, skills, and community bonds</li>
                <li>- A strong culture of learning by doing</li>
              </ul>

              <div className="mt-5 rounded-2xl border border-[#622599]/20 bg-[#622599]/5 p-4 text-sm text-[#3b175a]">
                Open Scout Unit means: if you're interested, you're welcome. We'll guide you.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS PREVIEW (component) */}
      <section className="container-x pb-6">
        <UpcomingEvents />
      </section>

      {/* ABOUT (full-width) */}
      <section id="about" className="container-x py-10">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">About us</h2>
          <p className="mt-3 text-slate-700 dark:text-slate-300">
            XV Kanteerava is a volunteer-led scout unit focused on community impact and personal growth. We welcome
            students, working professionals, alumni, and anyone willing to contribute time, skills, and effort.
          </p>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            {/* Highlights */}
            <div className="grid gap-4">
              {highlights.map((h) => (
                <div key={h.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#622599] text-white">
                    <h.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{h.title}</div>
                    <div className="text-sm text-slate-600">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Org snapshot */}
            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                <div className="text-xs text-slate-500">Current strength</div>
                <div className="mt-1 text-3xl font-extrabold text-[#622599]">{memberCount === null ? "—" : memberCount}</div>
                <div className="mt-1 text-sm text-slate-600">People currently in the organization.</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                <div className="text-xs text-slate-500">Volunteers</div>
                <div className="mt-1 text-3xl font-extrabold text-[#622599]">
                  {volunteerCount === null ? "—" : volunteerCount}
                </div>
                <div className="mt-1 text-sm text-slate-600">Active volunteers currently involved.</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                <div className="font-extrabold">Current leaders</div>

                {leaders.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-600">No leaders added yet.</div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {leaders.map((l) => (
                      <div key={l.id} className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {l.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cleanText(l.photo_url)}
                                alt={cleanText(l.name)}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // hide broken images without console spam
                                  ; (e.currentTarget as HTMLImageElement).style.display = "none"
                                }}
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-[10px] text-slate-500">No photo</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{cleanText(l.name)}</div>
                            <div className="truncate text-xs text-slate-600">{cleanText(l.role)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-500">Leaders are managed in admin and reflected here automatically.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WINGS */}
      <section id="wings" className="container-x py-10">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Wings in our scouting</h2>
          <p className="mt-3 text-slate-700 dark:text-slate-300">Different wings for different ages - same purpose: build character, skills, leadership, and service.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {wings.map((w) => (
              <div key={w.title} className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                <div className="text-xs font-semibold text-[#622599]">Motto: {w.motto}</div>
                <div className="mt-1 text-lg font-extrabold">{w.title}</div>
                <div className="mt-3 text-sm text-slate-700">{w.boys}</div>
                <div className="text-sm text-slate-700">{w.girls}</div>
                <div className="mt-3 text-sm text-slate-600">{w.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORY (interactive timeline full-width) */}
      <section id="history" className="container-x py-10">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Our history</h2>
          <p className="mt-3 text-slate-700 dark:text-slate-300">75 years of discipline, service, and leadership through action. Tap to expand, tap again to collapse.</p>

          <div className="mt-6 grid gap-3">
            {history.map((t) => {
              const open = expandedHistory === t.id
              return (
                <div key={t.id} className="rounded-2xl border border-slate-200 bg-white/70">
                  <button
                    type="button"
                    onClick={() => setExpandedHistory((cur) => (cur === t.id ? null : t.id))}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#622599]">{t.year}</div>
                      <div className="mt-1 font-extrabold">{t.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{t.desc}</div>
                    </div>
                    <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="border-t border-slate-200 px-4 pb-4">
                      <div className="pt-3 text-sm text-slate-700">{t.details}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* WORK (full-width) */}
      <section id="work" className="container-x py-10">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">The work we do</h2>
          <p className="mt-3 text-slate-700 dark:text-slate-300">Practical community work + skill-building. Simple idea: show up, learn fast, and do real things that help.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {work.map((w) => (
              <div key={w.title} className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                <div className="font-semibold">{w.title}</div>
                <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                  {w.points.map((p) => (
                    <li key={p}>- {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#622599]/20 bg-[#622599]/5 p-5">
            <div>
              <div className="font-semibold text-[#3b175a]">Want to join the next activity?</div>
              <div className="text-sm text-[#3b175a]/80">Drop a message. We'll share upcoming plans and how you can participate.</div>
            </div>
            <Link className="btn-primary" href="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
