import PropertyForm from "../../../features/properties/presentation/components/PropertyForm";
import { redirect } from "next/navigation";
import { createCookieClient } from "@/src/lib/supabase/cookie-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maskanny | Create a Property Listing",
};

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
    <main className="create-listing-page !mt-0 !pt-4 sm:!pt-5">
      <div className="create-listing-container mx-auto w-full max-w-[1040px]">
        <header className="relative mb-8 overflow-hidden rounded-2xl border border-[#385F71]/15 bg-white px-7 py-8 sm:px-10 sm:py-9">
          <div aria-hidden="true" className="absolute top-0 left-0 h-full w-1 bg-[#D7B377]" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D7B377]/40 bg-[#F8F9FB] px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-[#D7B377]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2B4162]">
                Property listing
              </span>
            </div>

            <h3 className="max-w-[620px] text-[30px] leading-[1.2] font-semibold tracking-[-0.035em] text-[#2B4162] sm:text-[36px]">
              Your property.
              <span className="block text-[#385F71]">Their next chapter.</span>
            </h3>

            <p className="mt-4 max-w-[540px] text-[14px] leading-6 text-[#6F7F8D] sm:text-[15px]">
              Add your property details, location, and photos to help students find a place that
              feels like home. Your listing will be reviewed before publication.
            </p>
          </div>
        </header>

        {hostError ? (
          <p role="alert" className="rounded-xl bg-[var(--danger-bg)] p-4 text-[var(--danger)]">
            We couldn&apos;t check your Host access. Please refresh and try again.
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
