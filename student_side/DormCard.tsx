"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dorm } from "./types";

const GENDER_LABEL: Record<string, string> = {
  male: "Men only",
  female: "Women only",
  mixed: "Mixed",
};

function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

interface DormCardProps {
  dorm: Dorm;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  priority?: boolean;
}

export default function DormCard({ dorm, saved = false, onToggleSave, priority = false }: DormCardProps) {
  const chips: string[] = [];
  if (dorm.gender && GENDER_LABEL[dorm.gender]) chips.push(GENDER_LABEL[dorm.gender]);
  if (dorm.roomType) chips.push(dorm.roomType);
  if (typeof dorm.availableRooms === "number") {
    chips.push(dorm.availableRooms === 1 ? "1 room left" : `${dorm.availableRooms} rooms left`);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.06] transition-shadow duration-300 hover:shadow-[0_18px_50px_-24px_rgba(22,23,26,0.28)]">
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-[#E8E5DE]">
        {dorm.imageUrl ? (
          <Image
            src={dorm.imageUrl}
            alt={`${dorm.name} in ${dorm.location}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8A8B82]">No photo yet</div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/25 to-transparent" />

        {typeof dorm.distanceFromUniversity === "number" && (
          <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-medium text-[#16171A] backdrop-blur-sm">
            {dorm.distanceFromUniversity} km from campus
          </span>
        )}

        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(dorm.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${dorm.name} from saved` : `Save ${dorm.name}`}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/92 backdrop-blur-sm transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z"
                fill={saved ? "#16171A" : "none"}
                stroke="#16171A"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3  className="text-[17px] font-medium leading-snug tracking-[-0.015em] text-[#16171A] sm:text-[19px]">{dorm.name}</h3>
          <p className="mt-1.5 text-sm text-[#6F7168]">
            {dorm.location}
            {dorm.university ? ` · near ${dorm.university}` : ""}
          </p>
        </div>

        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip} className="rounded-full bg-[#F1EFE9] px-3 py-1 text-xs text-[#5A5C54]">
                {chip}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-black/[0.07] pt-5">
          <p className="text-[22px] font-medium tracking-[-0.02em] text-[#16171A]">
            {formatPrice(dorm.price)}
            <span className="ml-1 text-sm font-normal text-[#6F7168]">/ month</span>
          </p>

          <Link
            href={`/dorms/${dorm.id}`}
            className="rounded-full bg-[#16171A] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#33352F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16171A]"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
