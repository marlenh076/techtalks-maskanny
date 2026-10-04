import { MapPin } from "lucide-react";
import type { University } from "@/src/features/universities/models/university.model";

export function PropertyUniversities({
  universities,
}: {
  universities: University[];
}) {
  return (
    <section className="mb-14 border-b border-[var(--line)] pb-14 last:mb-0 last:border-b-0">
      <span className="mb-3.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--soft)]">
        Nearby campus
      </span>
      <h2 className="mb-[22px] text-[30px] font-medium tracking-[-0.03em] text-[var(--ink)] max-[520px]:text-[26px]">
        Universities
      </h2>
      {universities.length ? (
        <div className="grid gap-3">
          {universities.map((university) => (
            <div
              key={university.university_id}
              className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-5 py-[18px] shadow-[0_0_0_1px_var(--line)]"
            >
              <h3 className="m-0 text-base font-semibold">{university.name}</h3>
              <p className="mt-[7px] flex items-center gap-1.5 text-[13px] text-[var(--soft)]">
                <MapPin size={15} />
                {university.city}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--soft)]">
          No universities are linked to this property yet.
        </p>
      )}
    </section>
  );
}
