import Link from "next/link"
import Image from "next/image"

const nav = [
  { label: "About", href: "/#about" },
  { label: "Wings", href: "/#wings" },
  { label: "History", href: "/#history" },
  { label: "What We Do", href: "/#work" },
  { label: "Events", href: "/events" },
  { label: "Experiences", href: "/experiences" },
  { label: "Contact", href: "/contact" },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <Image
              src="/brand/xvksg-logo.png"
              alt="XV Kanteerava Scouts & Guides"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-extrabold">XV Kanteerava</div>
            <div className="text-xs text-slate-600">Open Scout Unit | Since 1950</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-slate-700 hover:text-[#622599]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/experiences/new" className="btn-primary hidden sm:inline-flex">
            Share a Story
          </Link>
        </div>
      </div>
    </header>
  )
}
