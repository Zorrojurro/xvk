import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
      <div className="container-x grid gap-6 md:grid-cols-3">
        <div>
          <div className="text-sm font-extrabold">XV Kanteerava</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            A 75-year-old open scout unit. Anyone with interest can join and serve.
          </p>
        </div>

        <div className="text-sm">
          <div className="font-semibold">Quick links</div>
          <div className="mt-2 grid gap-2 text-slate-700 dark:text-slate-200">
            <Link href="/#about" className="hover:text-purple-700 dark:hover:text-purple-300">About</Link>
            <Link href="/events" className="hover:text-purple-700 dark:hover:text-purple-300">Events</Link>
            <Link href="/experiences" className="hover:text-purple-700 dark:hover:text-purple-300">Experiences</Link>
            <Link href="/contact" className="hover:text-purple-700 dark:hover:text-purple-300">Contact</Link>
          </div>
        </div>

        <div className="text-sm">
          <div className="font-semibold">What we offer</div>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Volunteers • Service projects • Camps • Leadership • Community impact
          </p>
        </div>
      </div>

      <div className="container-x mt-8 text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} XV Kanteerava Open Scout Unit
      </div>
    </footer>
  )
}
