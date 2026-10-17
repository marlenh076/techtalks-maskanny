"use client";

import Link from "next/link";
import { use, useState, type FormEvent } from "react";
import { isAuthError } from "@supabase/supabase-js";
import { userCreateSchema } from "@/src/features/users/validation/user.schema";
import { supabase } from "@/src/lib/supabase/client";
import { savePendingVerification } from "@/src/lib/supabase/pending-verification";
import { postAuthDestination } from "@/src/lib/supabase/post-auth-destination";
import { safeReturnPath } from "@/src/lib/supabase/safe-return";
import { AuthButton, AuthField, AuthHeading, AuthNotice, AuthPhoneField } from "../auth-ui";
import { localPhoneInput, normalizeLebanesePhone } from "./phone";
import { signupErrorMessage, unexpectedSignupErrorMessage } from "./signup-error";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = use(searchParams);
  const next = safeReturnPath(typeof params.next === "string" ? params.next : null);
  const signInHref = next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setPhoneError(null);
    const data = new FormData(event.currentTarget);
    const normalizedPhone = normalizeLebanesePhone(String(data.get("phone") ?? ""));
    if (!normalizedPhone) {
      setPhoneError("Enter a Lebanese number, like 03 123456 or 71 123456.");
      return;
    }
    const profile = userCreateSchema.safeParse({
      firstname: String(data.get("firstname") ?? "").trim(),
      lastname: String(data.get("lastname") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: normalizedPhone.national,
    });
    if (!profile.success) {
      setError(profile.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    const password = String(data.get("password") ?? "");
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== data.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data: result, error: signUpError } = await supabase.auth.signUp({
        email: profile.data.email,
        password,
        options: {
          data: {
            firstname: profile.data.firstname,
            lastname: profile.data.lastname,
            phone: normalizedPhone.e164,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signupErrorMessage(signUpError));
        return;
      }
      if (result.session && result.user) {
        window.location.replace(await postAuthDestination(result.user.id, next));
        return;
      }
      try {
        savePendingVerification(profile.data.email, next);
      } catch {
        setError(
          "We couldn't save your email for resend. If a confirmation link arrives, open it. You can also sign in.",
        );
        return;
      }
      window.location.replace("/verify-email");
    } catch (cause) {
      setError(
        isAuthError(cause) ? signupErrorMessage(cause) : unexpectedSignupErrorMessage(cause),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeading
        title="Create your account"
        description="Start finding a place that feels like home."
      />
      <form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 min-[700px]:grid-cols-2 min-[900px]:grid-cols-1 min-[1100px]:grid-cols-2">
          <AuthField
            id="firstname"
            name="firstname"
            label="First name"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            required
          />
          <AuthField
            id="lastname"
            name="lastname"
            label="Last name"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            required
          />
        </div>
        <AuthField
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <div>
          <AuthPhoneField
            value={phone}
            onChange={(value) => {
              setPhone(localPhoneInput(value));
              setPhoneError(null);
            }}
            error={phoneError}
          />
          <p id="phone-help" className="mt-2 text-xs leading-5 text-[var(--soft)]">
            Lebanese mobile or landline number.
          </p>
        </div>
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          required
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Enter it again"
          required
        />
        <AuthNotice message={error} />
        <div className="pt-2">
          <AuthButton loading={loading}>
            {loading ? "Creating account…" : "Create account"}
          </AuthButton>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--soft)]">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="auth-switch-link font-semibold underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ink)]"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
