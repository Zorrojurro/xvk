import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Events | XV Kanteerava",
    description: "Upcoming camps, drives, training sessions, and meetups from XV Kanteerava Scout Unit.",
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
    return children
}
