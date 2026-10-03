"use client";

import { countActiveFilters, hasActiveFilters, type DormFilters } from "./types";

const UNIVERSITIES = [
  "American University of Beirut",
  "Lebanese American University",
  "Lebanese University",
  "Université Saint-Joseph",
  "Notre Dame University",
  "Beirut Arab University",
  "Holy Spirit University of Kaslik",
];

const LOCATIONS = ["Hamra", "Ras Beirut", "Achrafieh", "Badaro", "Jounieh", "Byblos", "Tripoli", "Saida", "Zahlé"];
const ROOM_TYPES = ["Single", "Double", "Triple", "Shared"];
const GENDER_OPTIONS: Array<{ value: DormFilters["gender"]; label: string }> = [
  { value: "", label: "Anyone" },
  { value: "female", label: "Women only" },
  { value: "male", label: "Men only" },
  { value: "mixed", label: "Mixed" },
];

interface DormFilterPanelProps {
  filters: DormFilters;
  onChange: <K extends keyof DormFilters>(key: K, value: DormFilters[K]) => void;
  onReset: () => void;
  open: boolean;
  onToggle: () => void;
}

const fieldClass =
  "w-full appearance-none rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 text-sm text-[#16171A] transition-colors duration-200 focus:border-[#16171A] focus:outline-none";
const labelClass = "mb-2 block text-[13px] text-[#5A5C54]";

export default function DormFilterPanel({ filters, onChange, onReset, open, onToggle }: DormFilterPanelProps) {
  const activeCount = countActiveFilters(filters);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="dorm-filter-fields"
          className="flex items-center gap-2 rounded-full border border-black/[0.08] px-5 py-3 text-sm font-medium text-[#16171A] transition-colors duration-200 hover:border-[#16171A]"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path d="M3 6h14M6 10h8M8.5 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#16171A] px-1.5 text-[11px] font-medium text-white">
              {activeCount}
            </span>
          )}
        </button>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-3 py-2 text-sm text-[#6F7168] underline-offset-4 transition-colors duration-200 hover:text-[#16171A] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div
        id="dorm-filter-fields"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-5 grid grid-cols-1 gap-5 border-t border-black/[0.07] pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="filter-university">University</label>
              <select id="filter-university" className={fieldClass} value={filters.university} onChange={(e) => onChange("university", e.target.value)}>
                <option value="">Any university</option>
                {UNIVERSITIES.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-location">Area</label>
              <select id="filter-location" className={fieldClass} value={filters.location} onChange={(e) => onChange("location", e.target.value)}>
                <option value="">Any area</option>
                {LOCATIONS.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-room-type">Room type</label>
              <select id="filter-room-type" className={fieldClass} value={filters.roomType} onChange={(e) => onChange("roomType", e.target.value)}>
                <option value="">Any type</option>
                {ROOM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-min-price">Price from (USD / month)</label>
              <input id="filter-min-price" type="number" min={0} inputMode="numeric" placeholder="0" className={fieldClass} value={filters.minPrice} onChange={(e) => onChange("minPrice", e.target.value)} />
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-max-price">Price up to (USD / month)</label>
              <input id="filter-max-price" type="number" min={0} inputMode="numeric" placeholder="No limit" className={fieldClass} value={filters.maxPrice} onChange={(e) => onChange("maxPrice", e.target.value)} />
            </div>

            <div>
              <label className={labelClass} htmlFor="filter-rooms">Rooms available</label>
              <select id="filter-rooms" className={fieldClass} value={filters.availableRooms} onChange={(e) => onChange("availableRooms", e.target.value)}>
                <option value="">Any</option>
                <option value="1">At least 1</option>
                <option value="2">At least 2</option>
                <option value="3">At least 3</option>
              </select>
            </div>

            <fieldset className="sm:col-span-2 lg:col-span-3">
              <legend className={labelClass}>Who it&apos;s for</legend>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((option) => {
                  const selected = filters.gender === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onChange("gender", option.value)}
                      className={`rounded-full border px-4 py-2.5 text-sm transition-colors duration-200 ${
                        selected ? "border-[#16171A] bg-[#16171A] text-white" : "border-black/[0.08] bg-white text-[#5A5C54] hover:border-[#16171A] hover:text-[#16171A]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
