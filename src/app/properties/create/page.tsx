import PropertyForm from "../../../features/properties/presentation/components/PropertyForm";
import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";
import { AuthenticatedHeader } from "@/src/components/auth/AuthenticatedHeader";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create a property | Maskanny" };

export const dynamic = "force-dynamic";

export default async function CreatePropertyPage() {
  const supabase = await createCookieClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) redirect("/sign-in?next=%2Fproperties%2Fcreate");

  const { data: host, error: hostError } = await supabase
    .from("host")
    .select("host_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!host && !hostError) redirect("/host/onboarding");

  return (
    <main className="create-listing-page">
      <div className="create-listing-container mx-auto w-full max-w-[1040px]">
        <div className="mb-10 sm:mb-12">
          <AuthenticatedHeader email={user.email} />
        </div>

        <header className="create-listing-header">
          <span className="create-listing-eyebrow">PROPERTY LISTING</span>

          <h1>
            Create a place students
            <br />
            will want to call home.
          </h1>

          <p>
            Add your property details, location and photos, then submit your
            listing for review.
          </p>
        </header>

        {hostError ? (
          <p
            role="alert"
            className="rounded-xl bg-[var(--danger-bg)] p-4 text-[var(--danger)]"
          >
            We couldn&apos;t check your Host access. Please refresh and try
            again.
          </p>
        ) : (
          <PropertyForm searchEnabled={Boolean(process.env.GEOAPIFY_API_KEY)} />
        )}

        <footer className="create-listing-footer">
          <span>Maskanny</span>
          <p>Student housing, made simpler.</p>
        </footer>
      </div>
    </main>
  );
}
