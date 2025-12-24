# XV Kanteerava

Open Scout Unit website built with Next.js 16, Tailwind CSS v4, and Supabase.

## About

XV Kanteerava is a 75-year-old volunteer-led scout unit focused on community impact and personal growth. This website serves as the public-facing portal for the unit, featuring:

- **Public pages**: Homepage, Events, Experiences, Contact
- **Admin panel**: Manage leaders, stories, events, contacts, and RSVPs
- **Features**: Dark mode, mobile-responsive, SEO-optimized

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the required tables

### Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LEADERS_BUCKET=leaders
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Supabase Tables

The app expects the following tables:

- `org_stats` - Organization statistics (member_count)
- `leaders` - Unit leaders (name, role, photo_url, sort_order)
- `events` - Events (title, description, location, starts_at, ends_at, status)
- `event_rsvps` - Event RSVPs
- `experiences` - Volunteer stories (name, title, content, image_url, status)
- `contact_messages` - Contact form submissions
- `admins` - Admin users (user_id references auth.users)

## Storage Buckets

- `leaders` - Leader photos
- `experience-photos` - Volunteer story photos

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database/Auth/Storage**: Supabase
- **Icons**: Lucide React
- **Theme**: next-themes

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private project for XV Kanteerava Scout Unit.
