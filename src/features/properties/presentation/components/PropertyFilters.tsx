import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const fields = [
  {
    name: "property_type",
    label: "Property type",
    options: [
      ["dorm", "Dorm"],
      ["studio", "Studio"],
      ["apartment", "Apartment"],
    ],
  },
  {
    name: "furnished",
    label: "Furnished",
    options: [
      ["true", "Yes"],
      ["false", "No"],
    ],
  },
  {
    name: "electricity_included",
    label: "Electricity included",
    options: [
      ["true", "Yes"],
      ["false", "No"],
    ],
  },
  {
    name: "gender",
    label: "Gender",
    options: [
      ["boys", "Boys"],
      ["girls", "Girls"],
      ["mixed", "Mixed"],
    ],
  },
] as const;

export function PropertyFilters({
  values,
  mobileOpen,
  onClose,
}: {
  values: Record<string, string>;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onClose]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="fixed inset-0 z-30 hidden w-full border-0 bg-[var(--filter-backdrop)] max-md:block"
          onClick={onClose}
        />
      )}
      <aside
        className={`mb-[30px] rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_36px_-32px_rgba(22,23,26,0.5)] max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-40 max-md:mb-0 max-md:max-h-[90vh] max-md:overflow-y-auto max-md:rounded-b-none max-md:px-5 max-md:pt-[22px] max-md:pb-7 max-md:shadow-[0_-18px_48px_rgba(20,35,55,0.18)] ${mobileOpen ? "max-md:block" : "max-md:hidden"}`}
        aria-label="Property filters"
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
      >
        <div className="mb-5 hidden items-center justify-between gap-4 max-md:flex">
          <h2 className="m-0 text-[19px] font-[750]">Search & filters</h2>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border-0 bg-[var(--bg)]"
          >
            <X size={20} />
          </button>
        </div>
        <form
          action="/properties"
          method="get"
          className="grid gap-[22px] max-md:gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            const params = new URLSearchParams();
            for (const [key, value] of new FormData(event.currentTarget)) {
              if (typeof value === "string" && value.trim())
                params.set(key, value.trim());
            }
            router.push(`/properties${params.size ? `?${params}` : ""}`);
          }}
        >
          <label className="block min-w-0 text-[13px] font-bold text-[var(--ink)]">
            Search
            <input
              className="mt-2 block min-h-[58px] w-full min-w-0 rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface)] px-5 py-2.5 text-base font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--faint)] hover:border-[var(--soft)] focus:border-[var(--soft)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
              name="query"
              type="search"
              placeholder="City, address, or title"
              defaultValue={values.query ?? ""}
              key={`query-${values.query}`}
            />
          </label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 max-md:gap-[15px]">
            {fields.slice(0, 1).map((field) => (
              <label
                key={field.name}
                className="block min-w-0 text-[13px] font-bold text-[var(--ink)] max-md:col-span-2"
              >
                {field.label}
                <select
                  className="student-filter-select mt-2 flex h-[52px] w-full min-w-0 items-center justify-between rounded-[var(--radius-sm)] border border-transparent bg-[var(--bg)] py-2.5 pr-[18px] pl-[13px] text-sm font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] hover:border-[var(--line-strong)] focus:border-[var(--ink)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
                  name={field.name}
                  defaultValue={values[field.name] ?? ""}
                  key={`${field.name}-${values[field.name]}`}
                >
                  <option value="">Any</option>
                  {field.options.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="block min-w-0 text-[13px] font-bold text-[var(--ink)]">
              Min price
              <input
                className="mt-2 block h-[52px] w-full min-w-0 rounded-[var(--radius-sm)] border border-transparent bg-[var(--bg)] px-[13px] py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--faint)] hover:border-[var(--line-strong)] focus:border-[var(--ink)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
                name="min_price"
                type="number"
                min="0"
                step="1"
                placeholder="$0"
                defaultValue={values.min_price ?? ""}
                key={`min-${values.min_price}`}
              />
            </label>
            <label className="block min-w-0 text-[13px] font-bold text-[var(--ink)]">
              Max price
              <input
                className="mt-2 block h-[52px] w-full min-w-0 rounded-[var(--radius-sm)] border border-transparent bg-[var(--bg)] px-[13px] py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--faint)] hover:border-[var(--line-strong)] focus:border-[var(--ink)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
                name="max_price"
                type="number"
                min="0"
                step="1"
                placeholder="Any"
                defaultValue={values.max_price ?? ""}
                key={`max-${values.max_price}`}
              />
            </label>
            <label className="block min-w-0 text-[13px] font-bold text-[var(--ink)]">
              Bedrooms
              <input
                className="mt-2 block h-[52px] w-full min-w-0 rounded-[var(--radius-sm)] border border-transparent bg-[var(--bg)] px-[13px] py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--faint)] hover:border-[var(--line-strong)] focus:border-[var(--ink)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
                name="bedrooms"
                type="number"
                min="0"
                step="1"
                placeholder="Any"
                defaultValue={values.bedrooms ?? ""}
                key={`bed-${values.bedrooms}`}
              />
            </label>
            <label className="block min-w-0 text-[13px] font-bold text-[var(--ink)]">
              Bathrooms
              <input
                className="mt-2 block h-[52px] w-full min-w-0 rounded-[var(--radius-sm)] border border-transparent bg-[var(--bg)] px-[13px] py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--faint)] hover:border-[var(--line-strong)] focus:border-[var(--ink)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
                name="bathrooms"
                type="number"
                min="0"
                step="1"
                placeholder="Any"
                defaultValue={values.bathrooms ?? ""}
                key={`bath-${values.bathrooms}`}
              />
            </label>
            {fields.slice(1).map((field) => (
              <label
                key={field.name}
                className="block min-w-0 text-[13px] font-bold text-[var(--ink)] max-md:col-span-2"
              >
                {field.label}
                <select
                  className="student-filter-select mt-2 flex h-[52px] w-full min-w-0 items-center justify-between rounded-[var(--radius-sm)] border border-transparent bg-[var(--bg)] py-2.5 pr-[18px] pl-[13px] text-sm font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-[180ms] hover:border-[var(--line-strong)] focus:border-[var(--ink)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(22,23,26,0.08)]"
                  name={field.name}
                  defaultValue={values[field.name] ?? ""}
                  key={`${field.name}-${values[field.name]}`}
                >
                  <option value="">Any</option>
                  {field.options.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 max-md:[&>*]:flex-1">
            <Link
              href="/properties"
              className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface)] px-[18px] py-2.5 text-sm font-bold text-[var(--ink)] hover:border-[var(--soft)] hover:bg-[var(--bg)]"
            >
              Clear
            </Link>
            <button className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[var(--ink)] bg-[var(--ink)] px-[18px] py-2.5 text-sm font-bold text-[var(--btn-ink)] hover:bg-[var(--soft)]">
              Show properties
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
