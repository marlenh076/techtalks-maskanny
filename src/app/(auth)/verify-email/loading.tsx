import Link from "next/link";
import { AuthHeading } from "../auth-ui";

export default function VerifyEmailLoading() {
  return (
    <>
      <AuthHeading title="Checking your account" description="This will only take a moment." />
      <p role="status" className="text-sm text-[var(--soft)]">Please wait…</p>
      <Link href="/sign-in" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--ink)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]">Go to sign in</Link>
    </>
  );
}
