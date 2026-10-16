"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useMarketplaceAccount } from "@/src/components/navigation/useMarketplaceAccount";
import type { MarketplaceAccount } from "@/src/components/navigation/useMarketplaceAccount";
import {
  profileApi,
  ProfileRequestError,
  validateProfileFields,
} from "../client/profile";
import type { ProfileFields, UserProfile } from "../client/profile";
import { SavedProperties } from "./SavedProperties";

type Account = Extract<MarketplaceAccount, { status: "authenticated" }>;

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#385F71]";

const buttonClass = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2B4162] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#385F71] disabled:cursor-wait disabled:opacity-60 ${focusClass}`;

const cardClass =
  "min-w-0 rounded-2xl border border-[#385F71]/15 bg-white p-5 shadow-sm sm:p-6";

const fieldClass =
  "mt-2 block min-h-[48px] w-full min-w-0 rounded-xl border border-[#385F71]/15 bg-[#F8F9FB] px-4 py-3 text-sm text-[#2B4162] placeholder:text-[#6F7F8D] transition-colors hover:border-[#385F71]/40 focus:border-[#385F71] focus:outline-2 focus:outline-offset-2 focus:outline-[#385F71] aria-invalid:border-red-500 read-only:bg-[#F5F0F6] read-only:text-[#6F7F8D]";

const labelClass = "block min-w-0 text-[13px] font-semibold text-[#2B4162]";

const signInHref = "/sign-in?next=%2Fprofile";

function isSessionError(error: unknown) {
  return (
    error instanceof ProfileRequestError &&
    (error.status === 401 || error.status === 403)
  );
}

function PersonalInformation({
  profile,
  email,
  onSaved,
  onSessionChanged,
}: {
  profile: UserProfile;
  email: string;
  onSaved: (profile: UserProfile) => void;
  onSessionChanged: () => void;
}) {
  const [values, setValues] = useState<ProfileFields>({
    firstname: profile.firstname,
    lastname: profile.lastname,
    phone: profile.phone,
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileFields, string>>
  >({});

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const mutation = useRef<AbortController | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    return () => mutation.current?.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current) return;

    setMessage(null);

    const result = validateProfileFields(values);

    if (!result.success) {
      const errors: Partial<Record<keyof ProfileFields, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (
          field === "firstname" ||
          field === "lastname" ||
          field === "phone"
        ) {
          errors[field] ??= issue.message;
        }
      }

      setFieldErrors(errors);
      setMessage({
        kind: "error",
        text: "Please check the highlighted fields.",
      });

      return;
    }

    setFieldErrors({});
    inFlight.current = true;
    setSaving(true);

    const controller = new AbortController();
    mutation.current = controller;

    try {
      const updated = await profileApi.update(
        profile.user_id,
        result.data,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      setValues({
        firstname: updated.firstname,
        lastname: updated.lastname,
        phone: updated.phone,
      });

      onSaved(updated);

      setMessage({
        kind: "success",
        text: "Your changes have been saved.",
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      if (isSessionError(error)) {
        onSessionChanged();
      } else {
        setMessage({
          kind: "error",
          text:
            error instanceof ProfileRequestError
              ? error.message
              : "We couldn't save your changes. Check your connection and try again.",
        });
      }
    } finally {
      inFlight.current = false;

      if (!controller.signal.aborted) {
        setSaving(false);
      }
    }
  }

  const change = (field: keyof ProfileFields, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setMessage(null);
  };

  const field = (
    name: keyof ProfileFields,
    label: string,
    autoComplete: string,
    type = "text",
  ) => (
    <div className="min-w-0">
      <label className={labelClass} htmlFor={`profile-${name}`}>
        {label}

        <input
          id={`profile-${name}`}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          className={fieldClass}
          value={values[name]}
          onChange={(event) => change(name, event.target.value)}
          aria-invalid={!!fieldErrors[name]}
          aria-describedby={
            fieldErrors[name]
              ? `profile-${name}-error`
              : name === "phone"
                ? "profile-phone-hint"
                : undefined
          }
        />
      </label>

      {fieldErrors[name] && (
        <span
          id={`profile-${name}-error`}
          className="mt-2 block text-xs font-normal leading-5 text-red-600"
        >
          {fieldErrors[name]}
        </span>
      )}
    </div>
  );

  return (
    <section className={cardClass} aria-labelledby="personal-information-title">
      <h2
        id="personal-information-title"
        className="m-0 text-xl font-semibold tracking-tight text-[#2B4162]"
      >
        Personal information
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#6F7F8D]">
        Keep your name and contact details up to date.
      </p>

      <form noValidate onSubmit={submit} className="mt-5" aria-busy={saving}>
        <fieldset disabled={saving} className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">Personal information</legend>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            {field("firstname", "First name", "given-name")}

            {field("lastname", "Last name", "family-name")}

            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="profile-email" className={labelClass}>
                Email address
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  readOnly
                  value={email}
                  className={fieldClass}
                  aria-describedby="profile-email-hint"
                />
              </label>

              <p
                id="profile-email-hint"
                className="mt-2 text-xs leading-5 text-[#6F7F8D]"
              >
                Email is linked to your sign-in account. Email changes aren&apos;t
                available here.
              </p>
            </div>

            <div className="min-w-0 sm:col-span-2">
              {field("phone", "Phone number", "tel-national", "tel")}

              <p
                id="profile-phone-hint"
                className="mt-2 text-xs leading-5 text-[#6F7F8D]"
              >
                Use your 8-digit Lebanese number, without the country code.
              </p>
            </div>
          </div>
        </fieldset>

        {message && (
          <p
            role={message.kind === "error" ? "alert" : "status"}
            className={`mt-5 flex items-start gap-2 rounded-xl border p-3 text-sm leading-6 ${
              message.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.kind === "success" && (
              <Check size={17} aria-hidden="true" className="mt-1 shrink-0" />
            )}

            {message.text}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#385F71]/15 pt-5">
          <button type="submit" disabled={saving} className={buttonClass}>
            {saving ? "Saving changes…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AccountProfile({ account }: { account: Account }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    profileApi
      .get(account.userId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setProfile(data);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        setError(
          error instanceof ProfileRequestError
            ? error.message
            : "We couldn't load your profile. Check your connection and try again.",
        );
      });

    return () => controller.abort();
  }, [account.userId, revision]);

  if (error) {
    return (
      <ProfileError
        message={error}
        onRetry={() => {
          setError(null);
          setRevision((value) => value + 1);
        }}
      />
    );
  }

  if (!profile) return <ProfileLoading />;

  return (
    <ProfileContent
      account={account}
      profile={profile}
      onSaved={setProfile}
      onSessionChanged={() => {
        setProfile(null);
        setError(
          "Your session has changed. Reload your profile or sign in again.",
        );
      }}
    />
  );
}

export function ProfileContent({
  account,
  profile,
  onSaved,
  onSessionChanged,
}: {
  account: Account;
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
  onSessionChanged: () => void;
}) {
  const name = [profile.firstname, profile.lastname].filter(Boolean).join(" ");

  const email = account.email ?? profile.email;

  const initials = [profile.firstname, profile.lastname]
    .filter((part) => part.trim())
    .map((part) => Array.from(part.trim())[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <header className="mb-6 flex min-w-0 items-start gap-4 sm:mb-8 sm:items-center sm:gap-5">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-2xl border border-[#385F71]/15 bg-[#E9EEF2] text-xl font-semibold text-[#2B4162] sm:size-16"
        >
          {initials || <UserRound size={25} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="m-0 text-[clamp(28px,3.5vw,38px)] font-semibold leading-tight tracking-[-0.035em] text-[#2B4162]">
              My profile
            </h1>

            {account.role !== "student" && (
              <span className="rounded-full border border-[#385F71]/15 bg-[#E9EEF2] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#385F71]">
                {account.role}
              </span>
            )}
          </div>

          <p className="mt-2 text-base font-semibold text-[#2B4162] [overflow-wrap:anywhere]">
            {name || "Your account"}
          </p>

          <p className="mt-1 flex min-w-0 items-start gap-1.5 text-sm leading-6 text-[#6F7F8D]">
            <Mail size={14} aria-hidden="true" className="mt-1 shrink-0" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{email}</span>
          </p>

          <p className="mt-2 text-sm leading-6 text-[#6F7F8D]">
            Manage your details and keep your housing search in one place.
          </p>
        </div>
      </header>

      <div className="mb-6 grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <PersonalInformation
          profile={profile}
          email={email}
          onSaved={onSaved}
          onSessionChanged={onSessionChanged}
        />

        <section className={cardClass} aria-labelledby="account-security-title">
          <span className="mb-4 grid size-10 place-items-center rounded-xl border border-[#385F71]/15 bg-[#E9EEF2] text-[#385F71]">
            <ShieldCheck size={21} aria-hidden="true" />
          </span>

          <h2
            id="account-security-title"
            className="m-0 text-xl font-semibold tracking-tight text-[#2B4162]"
          >
            Account security
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6F7F8D]">
            Use the secure email recovery flow to choose a new password.
          </p>

          <Link
            href="/forgot-password"
            className={`mt-4 inline-flex min-h-12 items-center gap-2 rounded-full border border-[#385F71]/25 px-5 text-sm font-semibold text-[#2B4162] transition-colors hover:border-[#385F71]/50 hover:bg-[#E9EEF2] ${focusClass}`}
          >
            <LockKeyhole size={16} aria-hidden="true" />
            Change password
          </Link>
        </section>
      </div>

      <SavedProperties />
    </>
  );
}

function ProfileLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading your profile…</span>

      <div aria-hidden="true" className="mb-6 flex gap-4">
        <div className="size-16 rounded-2xl bg-[#E9EEF2]" />

        <div className="flex-1 space-y-3 py-2">
          <div className="h-7 w-40 max-w-full rounded bg-[#E9EEF2]" />
          <div className="h-4 w-60 max-w-full rounded bg-[#E9EEF2]" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`${cardClass} h-96 motion-safe:animate-pulse`}
      />
    </div>
  );
}

function ProfileError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className={cardClass}>
      <h1 className="m-0 text-2xl font-semibold tracking-tight text-[#2B4162]">
        Your profile is unavailable
      </h1>

      <p className="mt-3 text-sm leading-6 text-[#6F7F8D]">{message}</p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onRetry} className={buttonClass}>
          <RefreshCw size={16} aria-hidden="true" />
          Try again
        </button>

        <Link
          href={signInHref}
          className={`inline-flex min-h-11 items-center rounded-full text-sm font-semibold text-[#385F71] hover:text-[#2B4162] ${focusClass}`}
        >
          Sign in again
        </Link>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const { account, reload } = useMarketplaceAccount();

  useEffect(() => {
    if (account.status === "guest") {
      router.replace(signInHref);
    }
  }, [account.status, router]);

  return (
    <main className="student-marketplace min-h-screen bg-[#F5F0F6] text-[#2B4162]">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1184px] py-5 sm:w-[calc(100%-48px)] sm:py-7">
        {account.status === "authenticated" ? (
          <AccountProfile key={account.userId} account={account} />
        ) : account.status === "error" ? (
          <ProfileError
            message="We couldn't check your account. Please try again."
            onRetry={reload}
          />
        ) : (
          <ProfileLoading />
        )}
      </div>
    </main>
  );
}
