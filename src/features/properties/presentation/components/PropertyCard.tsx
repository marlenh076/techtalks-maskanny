import Link from "next/link";
import { BedDouble, Bath, MapPin } from "lucide-react";
import type { PropertyListing } from "../../service/discovery";
import { PropertyImage } from "./PropertyImage";

export function PropertyCard({ property }: { property: PropertyListing }) {
  return (
    <Link
      href={`/properties/${property.property_id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_6px_20px_-18px_rgba(22,23,26,0.65)] transition-[transform,box-shadow,border-color] duration-[220ms] hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[0_18px_36px_-22px_rgba(22,23,26,0.38)] focus-visible:outline-[3px] focus-visible:outline-[var(--soft)] focus-visible:outline-offset-[3px] motion-reduce:transition-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--placeholder-bg)]">
        <PropertyImage
          src={property.thumbnail_url}
          alt={`${property.title} exterior or interior`}
          className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        <span className="absolute top-4 left-4 rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] capitalize shadow-[0_3px_14px_rgba(0,0,0,0.08)]">
          {property.property_type}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="m-0 line-clamp-2 text-lg font-[750] leading-[1.3] text-[var(--ink)]">
            {property.title}
          </h2>
          <p className="m-0 shrink-0 text-right text-lg font-extrabold leading-[1.25] text-[var(--ink)]">
            ${property.price.toLocaleString()}
            <span className="block text-xs font-normal text-[var(--soft)]">
              / month
            </span>
          </p>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-sm leading-[1.45] text-[var(--soft)]">
          <MapPin size={15} className="mt-0.5 shrink-0" />
          <span className="truncate">{property.address}</span>
        </p>
        <div className="mt-[18px] flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-[var(--line)] pt-[17px] text-[13px] text-[var(--soft)]">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={16} />
            {property.bedrooms}{" "}
            {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath size={16} />
            {property.bathrooms}{" "}
            {property.bathrooms === 1 ? "bathroom" : "bathrooms"}
          </span>
          <span className="inline-flex items-center rounded-full bg-[var(--bg)] px-[9px] py-[5px] text-xs font-[650] text-[var(--ink)]">
            {property.furnished ? "Furnished" : "Unfurnished"}
          </span>
        </div>
      </div>
    </Link>
  );
}
