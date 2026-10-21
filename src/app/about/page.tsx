import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maskanny | About Us",
};

const features = [
  {
    icon: Search,
    title: "Find housing with ease",
    description:
      "Explore student accommodation options and compare properties based on location, price, property type, and amenities.",
  },
  {
    icon: ShieldCheck,
    title: "Make informed decisions",
    description:
      "Review available listing details, property information, and availability updates to help you choose housing that suits your needs.",
  },
  {
    icon: MapPin,
    title: "Stay close to campus",
    description:
      "Discover accommodation options near universities and focus on what matters most: your studies and student life.",
  },
];

export default function AboutPage() {
  return (
    <main className="student-marketplace min-h-screen bg-[#F5F0F6] text-[#1E3049]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1E3049] px-5 py-10 text-white sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#D7B377]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[#385F71]/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#E8D3AD]">
            <GraduationCap size={15} aria-hidden="true" />
            Built around student living
          </span>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            A better way to find your place.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#D4DDE8] sm:text-base">
            Finding a place to live while studying should feel simpler. Maskanny brings student
            housing options together in one place, helping students explore properties near their
            universities and helping property owners connect with them.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D7B377] px-5 py-2.5 text-sm font-semibold text-[#1E3049] transition hover:bg-[#E4C797] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore properties
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link
              href="/properties/create"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              List your property
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8F754F]">
              Our mission
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Helping students feel at home, wherever they study.
            </h2>
          </div>

          <div className="space-y-4 text-base leading-8 text-[#526174]">
            <p>
              Finding student accommodation can mean searching across different platforms, comparing
              scattered details, and trying to work out which location fits your daily routine and
              budget.
            </p>
            <p>
              Maskanny aims to make that process more organized by bringing property information and
              useful search options into one student-focused platform.
            </p>
            <p>
              Our goal is to help students make more informed housing decisions while giving
              property owners a dedicated place to present their accommodation to the student
              community.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#E2DCE5] bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8F754F]">
              What matters to us
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Designed around student needs
            </h2>
            <p className="mt-4 leading-7 text-[#647184]">
              Useful information and a straightforward way to explore housing options.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-[#E8E2E9] bg-[#FCFAFC] p-6 transition-shadow duration-200 hover:shadow-lg hover:shadow-[#1E3049]/5 sm:p-7"
                >
                  <div className="grid size-12 place-items-center rounded-xl bg-[#EAEFF3] text-[#2B4162]">
                    <Icon size={23} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#647184]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8F754F]">
              One platform, two communities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bringing students and property owners together.
            </h2>
          </div>

          <div className="mt-9 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-[#E2DCE5] bg-white p-7 sm:p-9">
              <div className="grid size-12 place-items-center rounded-xl bg-[#EAEFF3] text-[#2B4162]">
                <GraduationCap size={25} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">For students</h3>
              <p className="mt-3 text-sm leading-7 text-[#647184]">
                Explore accommodation options, compare important property details, and find a place
                that fits your university, preferences, and budget.
              </p>
              <Link
                href="/properties"
                className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-[#2B4162] hover:text-[#8F754F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2B4162]"
              >
                Find your next place
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="rounded-2xl border border-[#E2DCE5] bg-white p-7 sm:p-9">
              <div className="grid size-12 place-items-center rounded-xl bg-[#F5EBDD] text-[#8F754F]">
                <Building2 size={25} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">For property owners</h3>
              <p className="mt-3 text-sm leading-7 text-[#647184]">
                Present your accommodation, share useful property details, and reach students
                looking for housing near their universities.
              </p>
              <Link
                href="/properties/create"
                className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-[#2B4162] hover:text-[#8F754F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2B4162]"
              >
                List your property
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Trust and transparency */}
      <section className="bg-[#EAEFF3] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[auto_1fr] md:items-start md:gap-8">
          <div className="grid size-14 place-items-center rounded-2xl bg-white text-[#2B4162] shadow-sm">
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8F754F]">
              Trust and transparency
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Clear information helps you choose with confidence.
            </h2>
            <p className="mt-5 leading-8 text-[#526174]">
              We believe housing decisions should be based on useful, understandable information.
              Students should review listing details and availability information carefully, and
              property owners should keep their listings accurate and up to date.
            </p>
            <p className="mt-3 leading-8 text-[#526174]">
              If something about a listing seems incorrect or concerning, use the reporting options
              available on the platform, where provided. Always communicate with property owners to
              confirm important details before making housing or payment decisions.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#647184]">
              Listing information is not a guarantee of availability, property condition, or owner
              identity. Please confirm relevant details directly before committing to a property.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-3xl bg-[#1E3049] p-7 text-white sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D7B377]">
              Get in touch
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Have a question? We’re here to help.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#D4DDE8] sm:text-base">
              Whether you’re looking for student housing or want to list a property, reach out to
              the Maskanny team.
            </p>
          </div>

          <a
            href="mailto:maskanny.org@gmail.com"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#D7B377] px-5 py-3 text-sm font-semibold text-[#1E3049] transition hover:bg-[#E4C797] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:self-center"
          >
            <Mail size={18} aria-hidden="true" />
            Contact us
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <p className="mx-auto mt-5 max-w-6xl text-center text-sm text-[#647184]">
          You can also read our{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-[#2B4162] underline underline-offset-4 hover:text-[#8F754F]"
          >
            Privacy Policy
          </Link>{" "}
          to learn how we handle information.
        </p>
      </section>
    </main>
  );
}
