import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maskanny | Privacy Policy",
};

const sections = [
  {
    id: "information",
    number: "01",
    title: "Information We Collect",
    intro: "The information we collect depends on how you use Maskanny. This may include:",
    bullets: [
      "Account information, such as your name, email address, and authentication details.",
      "Property information, including descriptions, prices, locations, amenities, availability, and uploaded photographs.",
      "User activity, including favorites, reviews, reports, and information submitted through platform forms.",
      "Boosting information, including selected plans, transaction references, and payment evidence submitted for manual verification.",
      "Technical information, such as access logs, browser information, or device details, where collected by our application or service providers.",
    ],
  },
  {
    id: "usage",
    number: "02",
    title: "How We Use Your Information",
    intro: "We may use information to:",
    bullets: [
      "Create and manage student and property-owner accounts.",
      "Publish, maintain, review, approve, or reject property listings.",
      "Support searches, favorites, reviews, and property reports.",
      "Verify boosting-plan submissions and manage active or expired promotions.",
      "Send service emails about account activity, listing decisions, payment verification, and boosting expiry.",
      "Maintain platform security, prevent abuse, troubleshoot issues, and improve our services.",
    ],
  },
  {
    id: "visibility",
    number: "03",
    title: "Public Listings and Information Sharing",
    intro:
      "Maskanny is a property-discovery platform, so some information is intended to be visible to other users.",
    bullets: [
      "Published property details, photographs, prices, and other listing information may be visible to visitors.",
      "Reviews or other content submitted for public display may be visible to other users.",
      "Personal account information and private submissions should only be accessible to authorized users and personnel according to their purpose and access permissions.",
      "We may use service providers to support hosting, authentication, database storage, file storage, and email delivery.",
      "We may disclose information when required by applicable law or when necessary to protect legitimate rights and platform security.",
    ],
  },
  {
    id: "services",
    number: "04",
    title: "Third-Party Services",
    intro:
      "Maskanny relies on technology services to operate its platform. Depending on the features in use, these may include:",
    bullets: [
      "Supabase for authentication, database services, and file storage.",
      "PostgreSQL as the database technology used to organize platform information.",
      "Resend or another configured email provider to deliver service notifications.",
      "Whish Money or another relevant payment service for transactions handled outside the platform, where applicable.",
    ],
    outro:
      "These providers may process information as necessary to deliver their services. Their applicable privacy terms and practices should also be reviewed. Only services actually used by Maskanny should be listed in the published policy.",
  },
  {
    id: "payments",
    number: "05",
    title: "Boosting Plans and Payment Evidence",
    intro:
      "Property owners may submit payment references or screenshots when requesting a paid boosting plan.",
    bullets: [
      "Submitted information is used to review and verify the payment.",
      "Authorized personnel may access the evidence when reviewing a submission.",
      "A boosting plan should only be activated after the required verification and approval process is completed.",
      "Payment evidence should be retained only as long as reasonably necessary for verification, recordkeeping, dispute handling, or applicable legal requirements.",
    ],
    outro:
      "Maskanny should not request or store unnecessary financial information. The final policy must accurately describe the actual payment process and the information collected.",
  },
  {
    id: "security",
    number: "06",
    title: "Data Storage and Security",
    intro:
      "We use our configured infrastructure to store and process information required to operate Maskanny. Appropriate safeguards should be applied to protect it.",
    bullets: [
      "Access to personal information should be limited according to user roles and operational needs.",
      "Authentication and database permissions should help prevent unauthorized access.",
      "Private files and payment evidence should not be publicly accessible unless explicitly intended and appropriate.",
      "Sensitive credentials and server-only secrets should be protected and never exposed in public frontend code.",
    ],
    outro:
      "We take reasonable steps to protect information, but no online service or storage system can guarantee absolute security.",
  },
  {
    id: "retention",
    number: "07",
    title: "Data Retention and Deletion",
    intro:
      "We retain personal information for as long as reasonably necessary for the purposes described in this policy, subject to applicable legal and operational requirements.",
    bullets: [
      "Account and listing records may be retained while needed to provide the service.",
      "Payment-verification records may be retained for appropriate accounting, dispute-resolution, or compliance purposes.",
      "Security logs and technical records may be retained for troubleshooting and security.",
      "Deletion requests will be assessed in accordance with applicable law and any legitimate reasons to retain particular records.",
    ],
  },
  {
    id: "rights",
    number: "08",
    title: "Your Privacy Choices and Rights",
    intro:
      "Depending on applicable law, you may be entitled to request access to, correction of, or deletion of your personal information.",
    bullets: [
      "Keep your account information accurate and up to date.",
      "Contact the Maskanny team to ask about your personal information.",
      "Request correction or deletion of eligible information.",
      "Raise concerns about how your information is being used.",
    ],
    outro:
      "We may need to verify your identity before responding to a request. Some information may need to be retained where permitted or required by law.",
  },
  {
    id: "cookies",
    number: "09",
    title: "Cookies and Similar Technologies",
    intro:
      "Our website may use cookies or browser storage to support essential functions, such as authentication, session management, and user preferences.",
    outro:
      "The technologies actually used depend on the application's configuration and any integrated services. If analytics or advertising technologies are introduced, this policy should be updated to describe them and any applicable choices.",
  },
  {
    id: "children",
    number: "10",
    title: "Children's Privacy",
    intro:
      "Maskanny is designed for people seeking or offering accommodation. It is not intended to knowingly collect personal information from children where doing so would be unlawful.",
    outro:
      "If you believe a child has provided personal information inappropriately, contact the Maskanny team so the situation can be reviewed.",
  },
  {
    id: "changes",
    number: "11",
    title: "Changes to This Policy",
    intro:
      "We may update this Privacy Policy as Maskanny's features, services, or legal obligations change.",
    outro:
      "When updates are made, we will revise the date at the top of this page. Where required, we will provide additional notice of significant changes.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F5F0F6] text-[#2B4162]">
      {/* Introduction */}
      <section className="relative overflow-hidden bg-[#2B4162] text-white">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-4 -top-8 h-32 w-32 rounded-full border border-[#D7B377]/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D7B377]/40 bg-white/5 px-3 py-1.5 text-xs text-[#E6CC9A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D7B377]" />
            Your privacy matters
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Transparency builds trust. Learn how Maskanny collects, uses, stores, and protects
            information when you discover accommodation or publish a property on our platform.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/70 sm:text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              Last updated: October 18, 2026
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">11 sections</span>
          </div>
        </div>
      </section>
      {/* Policy content */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:py-16">
        {/* Table of contents */}
        <aside className="h-fit lg:sticky lg:top-8">
          <div className="rounded-2xl border border-[#2B4162]/10 bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8F754F]">
              On this page
            </p>

            <nav aria-label="Privacy Policy sections">
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm text-[#385F71] transition-colors hover:bg-[#F5F0F6] hover:text-[#2B4162]"
                    >
                      <span className="mt-0.5 text-xs tabular-nums text-[#8F754F]">
                        {section.number}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article className="min-w-0">
          <div className="mb-8 rounded-2xl border border-[#D7B377]/40 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold">About this policy</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              This Privacy Policy explains how Maskanny handles information associated with its
              student accommodation discovery and property-listing services. By using the platform,
              you should review this policy to understand the relevant data practices.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 rounded-2xl border border-[#2B4162]/10 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F0F6] text-sm font-semibold text-[#8F754F]">
                    {section.number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold tracking-tight text-[#2B4162] sm:text-2xl">
                      {section.title}
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                      {section.intro}
                    </p>

                    {section.bullets && (
                      <ul className="mt-4 space-y-3">
                        {section.bullets.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                          >
                            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D7B377]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.outro && (
                      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        {section.outro}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Contact */}
          <section className="mt-8 rounded-2xl bg-[#385F71] p-6 text-white sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#E6CC9A]">
              Need help?
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Questions about your privacy?</h2>
            <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
              Contact the Maskanny team through the contact information published on our official
              platform to ask questions or submit a privacy request.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D7B377] px-5 py-3 text-sm font-semibold text-[#2B4162] transition-colors hover:bg-[#E6CC9A]"
            >
              Return to Maskanny
              <span aria-hidden="true">→</span>
            </Link>
          </section>

          <p className="mt-8 px-2 text-xs leading-6 text-slate-500">
            This policy is a draft for the Maskanny platform and should be reviewed against the
            actual implementation and applicable privacy laws before publication.
          </p>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2B4162]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="text-lg font-semibold text-[#2B4162]">
            Maskanny<span className="text-[#D7B377]">.</span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link href="/privacy-policy" aria-current="page" className="font-medium text-[#8F754F]">
              Privacy Policy
            </Link>
            <Link href="/" className="text-[#385F71] transition-colors hover:text-[#2B4162]">
              Home
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Maskanny. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
