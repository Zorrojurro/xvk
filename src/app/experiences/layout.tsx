import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Experiences | XV Kanteerava",
    description: "Stories from camps, service drives, and memorable moments shared by XV Kanteerava volunteers.",
}

export default function ExperiencesLayout({ children }: { children: React.ReactNode }) {
    return children
}
