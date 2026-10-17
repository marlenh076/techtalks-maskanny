import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import type { University } from "@/src/features/universities/models/university.model";
import styles from "./PropertyDetails.module.css";

export function PropertyUniversities({ universities }: { universities: University[] }) {
  return (
    <section className={styles.section} aria-labelledby="property-universities-title">
      <h2 id="property-universities-title">Associated universities</h2>

      <p className={styles.muted}>
        Universities linked to this listing by the host. Check the location and journey before
        choosing.
      </p>

      {universities.length ? (
        <div className={styles.universities}>
          {universities.map((university) => (
            <Link
              className={styles.university}
              key={university.university_id}
              href={`/properties?university_id=${encodeURIComponent(university.university_id)}`}
            >
              <GraduationCap size={22} aria-hidden="true" />

              <span className={styles.universityCopy}>
                <strong>{university.name}</strong>
                {university.city && <span>{university.city}</span>}
              </span>

              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No universities are linked to this property yet.</p>
      )}
    </section>
  );
}
