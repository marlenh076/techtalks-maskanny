import Link from "next/link";
import { ArrowUpRight, BedDouble, Bath, Building2, Heart, House, MapPin, Sofa, UserRound, UsersRound, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PropertyListing } from "../../service/discovery";
import { PropertyImage } from "./PropertyImage";

const chipTones = {
  sage: "bg-[var(--success-bg)] text-[var(--success)]",
  beige: "bg-[var(--chip)] text-[var(--ink-2)]",
  blue: "bg-[#edf3fb] text-[#365b83]",
  pink: "bg-[#f8edf1] text-[#8a4660]",
};

const propertyTypeBadges = {
  studio: { icon: House, colors: chipTones.sage },
  apartment: { icon: Building2, colors: "bg-[var(--chip)] text-[#755a3c]" },
  dorm: { icon: BedDouble, colors: chipTones.blue },
} satisfies Record<PropertyListing["property_type"], { icon: LucideIcon; colors: string }>;

type FeatureChip = {
  label: string;
  icon: LucideIcon;
  tone: keyof typeof chipTones;
};

const residentChips: (FeatureChip & { gender: PropertyListing["gender"] })[] = [
  { gender: "boys", label: "Boys only", icon: UserRound, tone: "blue" },
  { gender: "girls", label: "Girls only", icon: UserRound, tone: "pink" },
  { gender: "mixed", label: "Mixed", icon: UsersRound, tone: "sage" },
];

type PropertyCardProps = {
  property: PropertyListing;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
};

export function PropertyCard({ property, saved = false, onToggleSave }: PropertyCardProps) {
  const typeBadge = propertyTypeBadges[property.property_type];
  const TypeIcon = typeBadge.icon;
  const features: FeatureChip[] = [
    { label: `${property.bedrooms} ${property.bedrooms === 1 ? "bedroom" : "bedrooms"}`, icon: BedDouble, tone: "sage" },
    { label: `${property.bathrooms} ${property.bathrooms === 1 ? "bathroom" : "bathrooms"}`, icon: Bath, tone: "beige" },
  ];
  if (property.furnished) features.push({ label: "Furnished", icon: Sofa, tone: "beige" });
  if (property.electricity_included) features.push({ label: "Electricity included", icon: Zap, tone: "beige" });
  const residentChip = residentChips.find((chip) => chip.gender === property.gender);
  if (residentChip) features.push(residentChip);

  return (
    <div className="relative flex w-full min-w-0">
      <Link
        href={`/properties/${property.property_id}`}
        className="group flex w-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[0_4px_20px_-12px_rgba(22,23,26,0.12)] transition-[box-shadow,border-color] duration-300 hover:border-[var(--line-strong)] hover:shadow-[0_18px_38px_-20px_rgba(22,23,26,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] motion-reduce:transition-none"
      >
        <div className="relative m-2 mb-0 h-[clamp(220px,58vw,250px)] overflow-hidden rounded-[calc(var(--radius-md)-8px)] bg-[var(--placeholder-bg)] md:aspect-[4/3] md:h-auto">
          <PropertyImage src={property.thumbnail_url} alt={property.title} className="h-full w-full object-cover object-top md:object-center" />
          <span className={`absolute top-6 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 px-2.5 py-1.5 text-xs leading-4 font-semibold capitalize shadow-sm ${typeBadge.colors}`}>
            <TypeIcon size={14} aria-hidden="true" className="shrink-0" />
            {property.property_type}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4 pt-3 md:p-5 md:pt-4">
          <p className="mb-2 flex flex-wrap items-baseline gap-x-1.5 text-[var(--success)] md:mb-3">
            <span className="text-[27px] font-semibold leading-tight tracking-[-0.04em]">${property.price.toLocaleString()}</span>
            <span className="text-xs font-medium text-[var(--soft)]">/ month</span>
          </p>
          <h3 className="m-0 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)] md:text-[19px]">{property.title}</h3>
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium leading-relaxed text-[#3D7659] md:mt-2">
            <MapPin size={15} strokeWidth={2.25} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="line-clamp-2 break-words">{property.address}</span>
          </p>
          <div className="mt-3 mb-3 flex flex-wrap items-center gap-1.5 md:mt-4 md:mb-5">
            {features.map(({ label, icon: Icon, tone }) => (
              <span key={label} className={`inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-xs leading-4 font-medium whitespace-nowrap ${chipTones[tone]}`}>
                <Icon size={14} aria-hidden="true" className="shrink-0" />
                {label}
              </span>
            ))}
          </div>
          <div aria-hidden="true" className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-2 text-xs font-semibold text-[var(--ink-2)] md:pt-3">
            <span className="group-hover:text-[var(--ink)]">View property</span>
            <span className="grid size-8 place-items-center rounded-full bg-[#3D7659] text-white transition-colors group-hover:bg-[#2D5C44] motion-reduce:transition-none"><ArrowUpRight size={16} /></span>
          </div>
        </div>
      </Link>
      {onToggleSave && (
        <button type="button" onClick={() => onToggleSave(property.property_id)} aria-pressed={saved} aria-label={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`} className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-white/70 bg-white text-[#E5484D] shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] motion-reduce:transition-none">
          <Heart size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
