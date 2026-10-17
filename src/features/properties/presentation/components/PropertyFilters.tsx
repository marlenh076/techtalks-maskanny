import { useRef } from "react";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { PropertySelect, PROPERTY_INPUT_CLASSES } from "./PropertySelect";

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
    label: "Residents",
    options: [
      ["boys", "Boys"],
      ["girls", "Girls"],
      ["mixed", "Mixed"],
    ],
  },
] as const;

const numberFields = [
  { name: "min_price", label: "Min price ($)", placeholder: "No minimum" },
  { name: "max_price", label: "Max price ($)", placeholder: "No maximum" },
  { name: "bedrooms", label: "Bedrooms", placeholder: "Any" },
  { name: "bathrooms", label: "Bathrooms", placeholder: "Any" },
] as const;

const labelClass = "block min-w-0 text-sm font-semibold text-[#2B4162]";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B377]";

export function PropertyFilters({
  values,
  expanded,
  onExpandedChange,
  onChange,
  onSearch,
  onClear,
}: {
  values: Record<string, string>;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onChange: (name: string, value: string) => void;
  onSearch: (params: URLSearchParams) => void;
  onClear: () => void;
}) {
  const searchInput = useRef<HTMLInputElement>(null);
  const advancedFilters = useRef<HTMLDivElement>(null);

  const activeCount = [...fields, ...numberFields].filter((field) => values[field.name]).length;

  const renderSelect = (field: (typeof fields)[number]) => (
    <label key={field.name} className={labelClass}>
      {field.label}
      <PropertySelect
        className="mt-2 font-medium"
        name={field.name}
        value={values[field.name] ?? ""}
        onChange={(event) => onChange(field.name, event.target.value)}
      >
        <option value="">Any</option>
        {field.options.map(([value, label]) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </PropertySelect>
    </label>
  );

  return (
    <aside
      id="property-filters"
      aria-label="Property search and filters"
      className="mb-8 rounded-2xl border border-[#385F71]/15 bg-white p-3 shadow-[0_12px_40px_-28px_rgba(43,65,98,0.35)] sm:p-5 md:mb-10"
    >
      <form
        action="/properties"
        method="get"
        onInvalidCapture={(event) => {
          if (!expanded && advancedFilters.current?.contains(event.target as Node)) {
            event.preventDefault();
            onExpandedChange(true);

            const input = event.target;

            requestAnimationFrame(() => {
              if (input instanceof HTMLInputElement) {
                input.focus({ preventScroll: true });
              }
            });
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();

          const params = new URLSearchParams();

          for (const [key, value] of new FormData(event.currentTarget)) {
            if (typeof value === "string" && value.trim()) {
              params.set(key, value.trim());
            }
          }

          if (advancedFilters.current?.contains(document.activeElement)) {
            searchInput.current?.focus({ preventScroll: true });
          }

          onSearch(params);
        }}
      >
        {values.university_id && (
          <input type="hidden" name="university_id" value={values.university_id} />
        )}

        {/* Main search row */}
        <div className="grid grid-cols-[minmax(0,1fr)_44px_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_48px_auto] sm:gap-3">
          <label className="min-w-0">
            <span className="sr-only">Search student properties</span>
            <input
              ref={searchInput}
              className={`${PROPERTY_INPUT_CLASSES} rounded-full!`}
              name="query"
              type="search"
              placeholder="City, university or property name"
              value={values.query ?? ""}
              onChange={(event) => onChange("query", event.target.value)}
            />
          </label>

          <button
            type="button"
            aria-label={`Advanced filters${activeCount ? `, ${activeCount} active` : ""}`}
            aria-expanded={expanded}
            aria-controls="property-advanced-filters"
            onClick={() => onExpandedChange(!expanded)}
            className={`relative grid size-11 place-items-center rounded-full border border-[#385F71]/20 bg-[#F8F9FB] text-[#2B4162] transition-colors hover:border-[#D7B377] hover:bg-[#E9EEF2] sm:size-12 motion-reduce:transition-none ${focusClass}`}
          >
            <SlidersHorizontal size={19} aria-hidden="true" />

            {activeCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#D7B377] px-1 text-[10px] leading-5 font-bold text-[#2B4162]"
              >
                {activeCount}
              </span>
            )}
          </button>

          <button
            type="submit"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7B377]/60 bg-[#2B4162] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#D7B377] hover:bg-[#385F71] hover:shadow-md active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:min-h-12 sm:px-6 ${focusClass}`}
          >
            <Search size={17} aria-hidden="true" className="hidden text-[#D7B377] sm:block" />
            Search
          </button>
        </div>

        {/* Helper text and advanced filters toggle */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
          <p className="text-xs leading-relaxed text-[#6F7F8D]">
            Find a place that feels like yours.
          </p>

          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="property-advanced-filters"
            onClick={() => onExpandedChange(!expanded)}
            className={`-mr-1 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-semibold text-[#2B4162] transition-colors hover:text-[#385F71] motion-reduce:transition-none ${focusClass}`}
          >
            Advanced filters
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`transition-transform duration-200 motion-reduce:transition-none ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Advanced filters */}
        <div
          ref={advancedFilters}
          id="property-advanced-filters"
          role="region"
          aria-label="Advanced filters"
          aria-hidden={!expanded}
          inert={!expanded}
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-3 grid gap-6 border-t border-[#385F71]/15 px-1 pt-6 pb-5 sm:px-2">
              <div className="md:max-w-[360px]">{renderSelect(fields[0])}</div>

              <fieldset className="min-w-0 border-0 border-t border-solid border-[#385F71]/15 p-0 pt-5">
                <legend className="sr-only">Monthly budget and space</legend>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {numberFields.map((field) => (
                    <label key={field.name} className={labelClass}>
                      {field.label}
                      <input
                        className={`${PROPERTY_INPUT_CLASSES} mt-2`}
                        name={field.name}
                        type="number"
                        min="0"
                        step="1"
                        placeholder={field.placeholder}
                        value={values[field.name] ?? ""}
                        onChange={(event) => onChange(field.name, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="min-w-0 border-0 border-t border-solid border-[#385F71]/15 p-0 pt-5">
                <legend className="sr-only">Living preferences</legend>

                <div className="grid gap-4 sm:grid-cols-3">{fields.slice(1).map(renderSelect)}</div>
              </fieldset>
            </div>

            {/* Clear filters row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#385F71]/15 px-1 pt-4 sm:px-2">
              <p className="text-xs text-[#6F7F8D]">Prices are per month in USD.</p>

              <button
                type="button"
                onClick={() => {
                  searchInput.current?.focus({ preventScroll: true });
                  onClear();
                }}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#385F71]/20 bg-white px-5 text-sm font-semibold text-[#2B4162] transition-colors hover:border-[#D7B377] hover:bg-[#E9EEF2] active:bg-[#F5F0F6] motion-reduce:transition-none sm:min-h-12 ${focusClass}`}
              >
                <RotateCcw size={15} aria-hidden="true" />
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </form>
    </aside>
  );
}
