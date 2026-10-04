"use client";

/**
 * The free-text input. One box covers name, area and university — students
 * rarely know which category their words belong to. No submit button: the
 * search hook debounces and searches as you type.
 */

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Rendered to the right of the input on wide screens (filter trigger). */
  trailing?: React.ReactNode;
}

export default function SearchBar({ value, onChange, trailing }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="dorm-search" className="sr-only">
          Search dorms by name, area or university
        </label>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8B82]"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="m13.5 13.5 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        <input
          id="dorm-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by dorm name, area or university"
          className="w-full rounded-full border border-transparent bg-[#F4F2ED] py-[18px] pl-[60px] pr-6 text-[15px] text-[#16171A] transition-colors duration-200 placeholder:text-[#8A8B82] focus:border-[#16171A] focus:bg-white focus:outline-none"
        />
      </div>

      {trailing}
    </div>
  );
}
