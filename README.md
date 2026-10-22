# Maskanny
[🚀 Live Demo](https://maskanny-web.vercel.app/) 

Maskanny is a student housing marketplace that helps students find homes near campus and helps property hosts manage listings.

## About the Project

Maskanny connects students looking for housing with hosts who have properties to rent. Students can explore listings and universities, while hosts can submit and manage properties. Admins review submissions and manage marketplace operations.

The application is built with the Next.js App Router and Supabase. This repository contains the application source and database migrations; it does not establish that the application is deployed.

## Features

### Students — implemented

- Create an account, sign in, confirm an email address, and recover a password.
- Browse and filter housing listings, view property details, and explore universities.
- Save favorite listings in browser storage. Favorites are not synced between devices.
- View host contact details when those details are available for a listing.

### Hosts — implemented

- Complete host onboarding and submit properties for review.
- Manage listings, property photos, and university associations from the Host Dashboard.
- View listing activity and property view analytics.
- Request listing boosts and submit payment claims for admin review.
- Manage profile, password, and support settings.

Property approval and boost activation are separate steps. A listing is publicly available only when it satisfies the application’s approval and active boost requirements.

### Admins — implemented

- Review, approve, or reject property submissions.
- Browse user and host records.
- Review boost requests and payment claims.
- View dashboard statistics, export supported reports, and manage account settings.

### In development or unavailable

- Reviews and ratings are not stored yet. The Admin Reviews screen and Host Reviews section are placeholders until review data and workflows are implemented.
- Whish Money payments are handled through a manual claim and admin review workflow. Automated Whish Money payment processing is not implemented.
- Location search depends on the optional `GEOAPIFY_API_KEY` setting.

## Tech Stack

- **Next.js 16** with the App Router and React 19
- **TypeScript**
- **Supabase** for Auth, PostgreSQL, Storage, and Row Level Security (RLS)
- **Tailwind CSS 4** and CSS Modules
- **Zod** for validation
- **Resend** for application email delivery
- **Recharts** for dashboard charts
- **Leaflet** and **React Leaflet** for maps
- **Radix UI Select** and **Lucide React** for interface components and icons
- **Sonner** for toast notifications

## Project Architecture

The application uses the Next.js App Router with feature-oriented, layered modules:

```text
src/
  app/                 App Router pages, layouts, and API route handlers
    (auth)/            Sign-in, sign-up, verification, and recovery routes
    (dashboard)/       Host and Admin dashboards
    api/               HTTP endpoints for marketplace and dashboard features
  components/          Shared navigation, Admin, and Host components
  features/
    admin/             Admin presentation, client API, services, repositories, and schemas
    boosting/          Boost plans, boost requests, and payment workflows
    properties/        Listing, media, moderation, contact, and analytics features
    universities/      University discovery and property associations
    users/             Profiles, hosts, and account services
  lib/                 Supabase clients, generated database types, auth, and email helpers
  shared/              Shared repository utilities
student_side/          Marketplace homepage, search, and student-facing components
supabase/
  config.toml          Local Supabase project configuration
  migrations/          Ordered PostgreSQL schema, security, and workflow migrations
public/                Static assets
```

Within feature modules, presentation components call services and repositories; models and validation schemas define the data contracts used across those layers. Next.js route handlers in `src/app/api` expose the server-side API.

### API route groups

- `/api/properties` and `/api/properties/[id]` cover listing discovery and management, with nested routes for media, universities, host contact, view tracking, and boosting. Location search is provided separately.
- `/api/universities` provides university discovery and related property listings.
- `/api/host/*` provides Host profile, listing, analytics, and password operations.
- `/api/admin/*` provides Admin listing moderation, user and host directory reads, boost review, reports, statistics, and settings.
- `/api/boosting_plans`, `/api/property_boosting`, and nested payment routes support boost plan and payment-claim workflows.
- `/api/media/[id]`, `/api/users/[id]`, `/api/test-email`, and `/api/cron/boost-expiry` provide media, profile, email-test, and scheduled boost-notification operations.

## Getting Started

### Prerequisites

- Node.js **20.9.0 or later**
- npm
- A Supabase project, or the Supabase CLI and Docker for local Supabase development

### Install dependencies

```bash
git clone <repository-url>
cd techtalks-maskanny
npm ci
```

Replace `<repository-url>` with the Git URL supplied by your team. This repository does not include a configured clone URL in its README or package metadata.

### Configure environment variables

Create a `.env.local` file in the repository root. Do not commit it; `.env*` files are ignored by Git. Use values from your own Supabase project and service providers. Never expose service credentials in client-side code or commit them to the repository.

| Variable                               | When it is needed                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Required for Supabase clients.                                                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Required for Supabase clients.                                                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only operations such as host contact lookup, view tracking, and the boost-expiry job. Keep this secret. |
| `GEOAPIFY_API_KEY`                     | Optional; enables location search in the property form.                                                        |
| `RESEND_API_KEY`                       | Needed when sending application emails, including boost-expiry notifications.                                  |
| `RESEND_FROM_EMAIL`                    | Optional sender override for Resend. The source uses Resend's onboarding sender when this is unset.            |
| `CRON_SECRET`                          | Needed to authorize requests to `/api/cron/boost-expiry`.                                                      |
| `NEXT_PUBLIC_SUPPORT_EMAIL`            | Optional support address shown in the Host Dashboard.                                                          |
| `NEXT_PUBLIC_WHISH_RECIPIENT_VERIFIED` | Set to the string `true` only when the public Whish recipient has been verified.                               |
| `NEXT_PUBLIC_WHISH_RECIPIENT`          | Public Whish recipient value; displayed only when the verified flag is `true`.                                 |

`supabase/config.toml` also contains environment substitutions for optional local Supabase services and providers, including Studio AI, Twilio SMS, Apple sign-in, and S3-compatible storage. Configure those only when enabling the corresponding local service.

### Configure Supabase Auth

Email confirmation is enabled in the checked-in Supabase configuration. Set the local Supabase Auth site URL and allowed redirect URLs for your development origin, including the application callback path `/auth/callback`. Configure the production origin and callback in the Supabase project before deploying.

### Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

The PostgreSQL schema and database-side workflows are maintained in `supabase/migrations`. The migrations define the marketplace tables, role and status types, triggers, Row Level Security policies, storage policies, and database functions used by moderation and host workflows.

For a local Supabase stack, install the Supabase CLI, review `supabase/config.toml`, and apply the ordered migrations with the CLI. For a linked Supabase project, review the migration changes, link the project, and apply them with `supabase db push`.

**Local setup note:** `supabase/config.toml` enables seeding and references `./seed.sql`, but this repository does not currently contain `supabase/seed.sql`. Resolve the seed-file configuration before relying on a local database reset workflow. No seed data is documented here.

RLS is enabled and policies are maintained through migrations. Do not rely on the publishable key as authorization: the application and database enforce access through authenticated user checks, role/ownership checks, RLS, and restricted database functions. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side because it bypasses RLS.

Core data includes user profiles, hosts, properties, media, universities and property-university associations, boost plans and requests, payment claims, and property-view records.

## Available Scripts

These are the scripts defined in `package.json`:

| Command                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.       |
| `npm run build`        | Create a production build.                  |
| `npm run start`        | Start the production server after building. |
| `npm run lint`         | Run ESLint.                                 |
| `npm run format`       | Format repository files with Prettier.      |
| `npm run format:check` | Check formatting with Prettier.             |

There is no test script or automated test suite checked into the repository. A standalone TypeScript check can be run with `npx tsc --noEmit`.

## Authentication and Roles

Supabase Auth handles email/password registration and sign-in, email confirmation, and password recovery. The profile table stores the database roles `user` and `admin`; a Host is represented by a related record in the `host` table rather than a separate profile-role enum value. The interface labels a regular user without a Host record as a Student.

- **Student (`user` without a Host record):** can browse public listings and manage their own profile and browser-saved favorites.
- **Host (authenticated user with a Host record):** can manage their own Host profile and properties, subject to server-side ownership checks and RLS.
- **Admin (`admin` profile):** can access Admin tools and moderation operations. Admin APIs and database functions perform role checks.

Dashboard layouts and API services validate authentication and role or ownership before allowing protected operations. Database RLS policies provide an additional authorization layer.

## Deployment

The app can be deployed to Vercel or another host that supports the Next.js Node.js runtime. This repository does not contain evidence that the application is currently deployed.

For a deployment:

1. Configure the Supabase project URL, publishable key, required server-only secrets, and any feature-specific provider variables in the hosting environment.
2. Apply reviewed migrations to the target Supabase database and configure the Auth site URL and redirect allowlist for the deployed domain.
3. Run `npm run build` as the production build check. Vercel can build and serve the Next.js application directly; other Node.js hosts can run `npm run start` after the build.
4. If boost-expiry emails are required, configure an external scheduler to call `/api/cron/boost-expiry` with `Authorization: Bearer <CRON_SECRET>`. No scheduler configuration is included in this repository.

Never add service-role keys or other server secrets to `NEXT_PUBLIC_*` variables.

## Development Status

The repository contains working student marketplace pages, account flows, Host listing and dashboard workflows, Admin moderation and operations screens, API route handlers, and Supabase migrations. Reviews and ratings remain unavailable. Boost payment claims are reviewed manually; automated Whish Money processing is not implemented. Location search and email delivery require their respective provider configuration.

No automated test runner or test files were found during this repository review. The project provides lint, formatting, build, and TypeScript-check commands for development validation.

## Setup Details to Confirm

- There is no `.env.example` or `.env.local.example`; create `.env.local` using the variable names above and values from your own services. Existing local environment values were not read or copied into this README.
- The Supabase project reference, deployed Supabase URL/keys, production Auth redirect allowlist, and hosting environment values are not specified in the repository.
- The local Supabase config references a seed file that is absent, as noted in [Database Setup](#database-setup).
