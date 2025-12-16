"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const canSubmit = useMemo(() => {
    return name.trim() && email.trim() && message.trim() && !loading
  }, [name, email, message, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOk(null)
    setErr(null)
    setLoading(true)

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: message.trim(),
      })
      if (error) throw error

      setOk("Message sent. We'll get back to you soon.")
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
    } catch (e: any) {
      setErr(e?.message || "Failed to send. Check Supabase keys/policies.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-xvk-radial">
      <section className="container-x py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6 md:p-8">
            <h1 className="text-3xl font-extrabold">Contact us</h1>
            <p className="mt-2 text-slate-700 dark:text-slate-200">
              Want to join, volunteer, collaborate, or invite us to a service activity? Send a message.
            </p>

            <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm text-purple-900 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-100">
              <div className="font-semibold">Tip</div>
              <div className="mt-1">
                Add your availability (weekends/weekday evenings) and what you want to help with.
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-700 dark:text-slate-200">
              <div className="font-semibold">You can also reach us directly</div>
              <div className="mt-2 text-slate-600 dark:text-slate-300">
                Email: <span className="font-medium">yourunit@email.com</span><br />
                Phone: <span className="font-medium">+91 XXXXXXXXXX</span>
              </div>
            </div>
          </div>

          <div className="card p-6 md:p-8">
            {ok && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-100">
                {ok}
              </div>
            )}
            {err && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
                {err}
              </div>
            )}

            <form className="grid gap-4" onSubmit={onSubmit}>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Name *</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-purple-400 dark:border-slate-800 dark:bg-slate-950/40"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Email *</span>
                <input
                  type="email"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-purple-400 dark:border-slate-800 dark:bg-slate-950/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Phone (optional)</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-purple-400 dark:border-slate-800 dark:bg-slate-950/40"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold">Message *</span>
                <textarea
                  className="min-h-[140px] rounded-xl border border-slate-200 bg-white/70 px-3 py-2 outline-none focus:border-purple-400 dark:border-slate-800 dark:bg-slate-950/40"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>

              <button className="btn-primary" disabled={!canSubmit} type="submit">
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
