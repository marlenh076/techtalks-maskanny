import { Check, BedDouble, Bath, Users } from "lucide-react";
import type { Property } from "../../models/property.model";

export function PropertyAmenities({ property }: { property: Property }) {
  const items = [
    { label: `${property.bedrooms} ${property.bedrooms === 1 ? "bedroom" : "bedrooms"}`, icon: BedDouble },
    { label: `${property.bathrooms} ${property.bathrooms === 1 ? "bathroom" : "bathrooms"}`, icon: Bath },
    { label: `${property.bed_count} ${property.bed_count === 1 ? "bed" : "beds"}`, icon: BedDouble },
    { label: property.furnished ? "Furnished" : "Unfurnished", icon: Check },
    { label: property.electricity_included ? "Electricity included" : "Electricity not included", icon: Check },
    { label: `${property.kitchen_type} kitchen`, icon: Check },
    { label: `${property.bathroom_type} bathroom`, icon: Check },
    { label: `${property.gender} housing`, icon: Users },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
      {items.map(({ label, icon: Icon }) => (
        <div key={label} className="flex min-h-[58px] items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--surface)] px-4 py-3.5 text-sm text-[var(--ink-2)] capitalize shadow-[0_0_0_1px_var(--line)]">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--chip)] text-[var(--ink)]">
            <Icon size={16} />
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
