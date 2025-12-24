import Link from "next/link"

export default function NotFound() {
    return (
        <main className="min-h-screen bg-xvk-radial">
            <section className="container-x py-20">
                <div className="card max-w-xl p-8 text-center">
                    <div className="text-6xl font-extrabold text-[#622599]">404</div>
                    <h1 className="mt-4 text-2xl font-extrabold">Page not found</h1>
                    <p className="mt-3 text-slate-600 dark:text-slate-300">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link href="/" className="btn-primary">
                            Go home
                        </Link>
                        <Link href="/contact" className="btn-ghost">
                            Contact us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
