import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-5 text-[var(--ink)] sm:px-6 sm:py-8 lg:px-10">
      <div className="grid w-full max-w-[1180px] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface)] shadow-[0_24px_80px_-48px_var(--ink)] min-[900px]:min-h-[680px] min-[900px]:grid-cols-[0.94fr_1.06fr] min-[900px]:p-5 xl:min-h-[720px]">
        <div className="flex min-w-0 flex-col px-6 py-8 sm:px-12 sm:py-10 min-[900px]:px-8 min-[900px]:py-11 xl:px-16">
          <Link href="/" aria-label="Maskanny home" className="inline-flex w-fit items-center gap-3 rounded-lg text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]">
            <Image src="/Maskanny.svg" alt="" width={42} height={42} className="size-10 rounded-xl" priority />
            <span className="text-xl font-semibold tracking-[-0.04em]">Maskanny<span className="text-[var(--soft)]">.</span></span>
          </Link>

          <div className="flex flex-1 flex-col justify-center py-8 sm:py-10 min-[900px]:py-8">
            <div className="mx-auto w-full max-w-[390px]">{children}</div>
          </div>
        </div>

        <aside className="relative m-2 hidden min-h-[640px] overflow-hidden rounded-tl-[112px] rounded-tr-[var(--radius-lg)] rounded-br-[112px] rounded-bl-[var(--radius-lg)] bg-[var(--placeholder-bg)] min-[900px]:block">
          <Image src="/images/auth-residence.webp" alt="Sunlit apartment residence with balconies and a landscaped courtyard" fill priority sizes="(max-width: 1200px) 50vw, 580px" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/10 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-[var(--btn-ink)] xl:p-14">
            <span className="mb-5 inline-block h-1 w-12 rounded-full bg-[var(--soft)]" aria-hidden="true" />
            <h2 className="max-w-[460px] text-[clamp(2.25rem,3.4vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.05em]">Find your place.<br />Feel at home.</h2>
            <p className="mt-4 max-w-[340px] text-sm leading-6 text-[var(--btn-ink)]/90 xl:text-base">Student housing for the way you live.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
