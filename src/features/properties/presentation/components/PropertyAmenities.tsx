import { BedDouble, Bath, BedSingle, Sofa, Zap, CookingPot, Users, DoorOpen } from "lucide-react";
import type { Property } from "../../models/property.model";
import styles from "./PropertyDetails.module.css";

export const residentLabels: Record<Property["gender"], string> = { boys: "Boys only", girls: "Girls only", mixed: "Mixed" };

export function PropertyAmenities({ property }: { property: Property }) {
  const specifications = [
    { label: "Bedrooms", value: property.bedrooms, icon: BedDouble },
    { label: "Bathrooms", value: property.bathrooms, icon: Bath },
    { label: "Beds", value: property.bed_count, icon: BedSingle },
  ];
  const amenities = [
    { label: typeof property.furnished !== "boolean" ? "Furnishing not provided" : property.furnished ? "Furnished" : "Unfurnished", included: property.furnished, icon: Sofa },
    { label: typeof property.electricity_included !== "boolean" ? "Electricity information not provided" : property.electricity_included ? "Electricity included" : "Electricity not included", included: property.electricity_included, icon: Zap },
  ];
  const facility = (value: string, noun: string) => value === "private" ? `Private ${noun}` : value === "shared" ? `Shared ${noun}` : `${noun} type not provided`;
  return <section className={styles.section} aria-labelledby="property-features-title">
    <h2 id="property-features-title">Inside the property</h2>
    <dl className={styles.specs}>{specifications.map(({ label, value, icon: Icon }) => <div className={styles.spec} key={label}>
      <Icon size={21} aria-hidden="true" /><dt>{label}</dt><dd>{typeof value === "number" && Number.isFinite(value) ? value : "—"}</dd>
    </div>)}</dl>
    <div className={styles.featureGroup}><h3>Amenities</h3><div className={styles.features}>
      {amenities.map(({ label, included, icon: Icon }) => <div className={styles.feature} key={label}><span className={`${styles.featureIcon} ${included === true ? "" : styles.featureOff}`}><Icon size={18} aria-hidden="true" /></span>{label}</div>)}
    </div></div>
    <div className={styles.featureGroup}><h3>Facilities</h3><div className={styles.features}>
      <div className={styles.feature}><span className={styles.featureIcon}><CookingPot size={18} aria-hidden="true" /></span>{facility(property.kitchen_type, "kitchen")}</div>
      <div className={styles.feature}><span className={styles.featureIcon}><DoorOpen size={18} aria-hidden="true" /></span>{facility(property.bathroom_type, "bathroom")}</div>
    </div></div>
    <div className={styles.featureGroup}><h3>Living arrangements</h3><div className={styles.features}>
      <div className={styles.feature}><span className={styles.featureIcon}><Users size={18} aria-hidden="true" /></span>{residentLabels[property.gender] ?? "Resident information not provided"}</div>
    </div></div>
  </section>;
}
