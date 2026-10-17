"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getPropertyCoordinates, propertyDirectionsUrl } from "./property-location";
import styles from "./PropertyDetails.module.css";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading} role="status">
      Loading property map…
    </div>
  ),
});

export function PropertyLocation({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const [interactive, setInteractive] = useState(false);
  const position = getPropertyCoordinates(latitude, longitude);
  return (
    <section className={styles.section} aria-labelledby="property-location-title">
      <div className={styles.sectionHeader}>
        <h2 id="property-location-title">Location</h2>
        {position && (
          <a
            href={propertyDirectionsUrl(position)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsLink}
          >
            Open directions <ArrowUpRight size={16} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
      <p className={styles.address}>
        <MapPin size={17} aria-hidden="true" />
        <span>{address || "Address not provided"}</span>
      </p>
      {position ? (
        <>
          <div className={styles.mapToolbar}>
            <p id="property-map-help">
              {interactive
                ? "Drag to explore, or use the zoom buttons. Scrolling over the map won’t zoom it."
                : "The pin shows the host’s saved location. Enable the map to pan and zoom."}
            </p>
            <button
              type="button"
              aria-pressed={interactive}
              onClick={() => setInteractive((value) => !value)}
              className={styles.secondaryButton}
            >
              {interactive ? "Stop map interaction" : "Explore map"}
            </button>
          </div>
          <PropertyMap position={position} readOnly interactive={interactive} />
          <p className={styles.coordinates}>
            {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
          </p>
        </>
      ) : (
        <p className={styles.empty}>
          A valid map location hasn’t been added to this listing. Ask the host for directions.
        </p>
      )}
    </section>
  );
}
