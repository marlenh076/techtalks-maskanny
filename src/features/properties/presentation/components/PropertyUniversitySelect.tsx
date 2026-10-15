"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { z } from "zod";
import type { University } from "@/src/features/universities/models/university.model";

const optionsSchema = z.array(
  z.object({
    university_id: z.uuid(),
    name: z.string(),
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
);

export default function PropertyUniversitySelect({
  selected,
  onChange,
  disabled,
  error,
}: {
  selected: University[];
  onChange: (universities: University[]) => void;
  disabled: boolean;
  error?: string;
}) {
  const [options, setOptions] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch("/api/universities", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("University request failed");
        const universities = optionsSchema.parse(await response.json());
        if (!controller.signal.aborted)
          setOptions(
            [
              ...new Map(
                universities.map((u) => [u.university_id, u]),
              ).values(),
            ].sort((a, b) => a.name.localeCompare(b.name)),
          );
      } catch {
        if (!controller.signal.aborted)
          setLoadError(
            "Universities could not be loaded. Try again, or continue without a selection.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  function toggle(university: University) {
    if (disabled) return;
    const exists = selected.some(
      (u) => u.university_id === university.university_id,
    );
    onChange(
      exists
        ? selected.filter((u) => u.university_id !== university.university_id)
        : [...selected, university],
    );
    setAnnouncement(`${university.name} ${exists ? "removed" : "selected"}.`);
  }
  const search = query.trim().toLocaleLowerCase();
  const visible = options.filter((u) =>
    `${u.name} ${u.city}`.toLocaleLowerCase().includes(search),
  );
  const focus =
    "focus-visible:outline-2 focus-visible:outline-(--ink) focus-visible:outline-offset-2";

  return (
    <div className="mt-7 min-w-0">
      <p
        id="universities-label"
        className="mb-2 text-[14px] font-medium text-(--ink-2)"
      >
        Nearby universities{" "}
        <span className="font-normal text-(--soft)">(optional)</span>
      </p>
      <p
        id="universities-help"
        className="mb-3 text-[12px] leading-5 text-(--soft)"
      >
        Choose universities relevant to this property from the predefined list.
        Distances are not verified.
      </p>
      <button
        type="button"
        id="universities"
        disabled={disabled}
        aria-labelledby="universities-label universities-value"
        aria-expanded={open && !disabled}
        aria-controls="universities-panel"
        aria-describedby={`universities-help${error ? " universities-error" : ""}`}
        onClick={() => setOpen(!open)}
        className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-(--radius-sm) border bg-(--bg) px-4 text-left text-[16px]! text-(--ink) hover:border-(--line-strong) disabled:cursor-not-allowed disabled:opacity-65 ${focus} ${error ? "border-(--danger) bg-(--danger-bg)" : "border-transparent"}`}
      >
        <span id="universities-value">
          {selected.length
            ? `${selected.length} ${selected.length === 1 ? "university" : "universities"} selected`
            : "Choose universities"}
        </span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>
      <p role="status" className="mt-2 text-[12px] text-(--soft)">
        {loading
          ? "Loading universities…"
          : !loadError && options.length === 0
            ? "No universities are available. You can continue without a selection."
            : ""}
      </p>
      {loadError && (
        <div
          role="alert"
          className="mt-2 text-[13px] leading-5 text-(--danger)"
        >
          <p>{loadError}</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setAttempt((n) => n + 1)}
            className={`min-h-[44px] rounded-(--radius-sm) px-2 font-medium underline disabled:opacity-50 ${focus}`}
          >
            Retry loading universities
          </button>
        </div>
      )}
      {open && !disabled && (
        <div
          id="universities-panel"
          className="mt-2 rounded-(--radius-sm) border border-(--line-strong) bg-(--surface) p-3 shadow-[0_8px_24px_-12px_rgba(22,23,26,0.2)]"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
              document.getElementById("universities")?.focus();
            }
          }}
        >
          <label htmlFor="university-search" className="sr-only">
            Search universities
          </label>
          <input
            id="university-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by university or city"
            className={`min-h-[48px] w-full rounded-(--radius-sm) border border-(--line-strong) bg-(--bg) px-3 text-[16px]! ${focus}`}
          />
          <fieldset className="mt-2 max-h-[264px] overflow-y-auto overscroll-contain border-0 p-0">
            <legend className="sr-only">University options</legend>
            {visible.map((university) => (
              <label
                key={university.university_id}
                className="m-0! flex! min-h-[48px] cursor-pointer items-center gap-3 rounded-(--radius-sm) px-2 py-2 hover:bg-(--chip) focus-within:bg-(--chip)"
              >
                <input
                  type="checkbox"
                  checked={selected.some(
                    (u) => u.university_id === university.university_id,
                  )}
                  onChange={() => toggle(university)}
                  className={`size-5 shrink-0 accent-(--ink) ${focus}`}
                />
                <span className="min-w-0 text-[14px] font-normal [overflow-wrap:anywhere]">
                  {university.name}
                  <span className="block text-[12px] text-(--soft)">
                    {university.city}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          {!loading && !loadError && options.length > 0 && !visible.length && (
            <p role="status" className="py-3 text-[13px] text-(--soft)">
              No universities match your search.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              document.getElementById("universities")?.focus();
            }}
            className={`mt-2 min-h-[44px] rounded-(--radius-full) border border-(--line-strong) px-4 text-[13px]! ${focus}`}
          >
            Done selecting
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <ul
          aria-label="Selected universities"
          className="mt-3 flex list-none flex-wrap gap-2 p-0"
        >
          {selected.map((university) => (
            <li
              key={university.university_id}
              className="flex max-w-full items-center gap-1 rounded-[22px] bg-(--chip) pl-3 text-[13px] text-(--ink)"
            >
              <span className="min-w-0 py-2 [overflow-wrap:anywhere]">
                {university.name}
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove university: ${university.name}`}
                onClick={() => {
                  toggle(university);
                  document.getElementById("universities")?.focus();
                }}
                className={`grid size-[44px] shrink-0 place-items-center rounded-(--radius-full) hover:bg-(--line) disabled:opacity-50 ${focus}`}
              >
                <X aria-hidden="true" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {error && (
        <p
          id="universities-error"
          role="alert"
          className="mt-2 text-[13px] leading-5 text-(--danger)"
        >
          {error}
        </p>
      )}
    </div>
  );
}
