"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  GraduationCap,
  House,
  MapPin,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import type { UniversitiesResource } from "@/src/features/universities/presentation/useUniversities";
import { HeroSearch } from "./HeroSearch";
import styles from "./MarketplaceHero.module.css";

export function MarketplaceHero({
  universities,
}: {
  universities: UniversitiesResource;
}) {
  return (
    <section aria-labelledby="homepage-hero-title" className={styles.hero}>
      <div className={styles.photograph}>
        <Image
          src="/images/hero-student-room.jpg"
          alt="Sunlit student bedroom with a study desk and a campus view"
          fill
          preload
          sizes="100vw"
          className={styles.image}
        />
      </div>
      <div className={styles.heading}>
        <h1 id="homepage-hero-title">Your next home starts here.</h1>
        <p>
          Find student housing near your university. Explore places that fit
          your budget and lifestyle.
        </p>
      </div>

      <div aria-hidden="true" className={styles.widgets}>
        <div className={styles.searchWidget}>
          <div className={styles.glassCard}>
            <div className={styles.widgetLabel}>
              <span>Your preferences</span>
              <SlidersHorizontal size={16} />
            </div>
            <p className={styles.widgetTitle}>A place that fits you.</p>
            <div className={styles.indicators}>
              <span>
                <MapPin size={14} />
                Location
              </span>
              <span>
                <Wallet size={14} />
                Budget
              </span>
              <span>
                <House size={14} />
                Housing
              </span>
            </div>
          </div>
        </div>
        <div className={styles.universityWidget}>
          <div className={styles.glassCard}>
            <div className={styles.widgetLabel}>
              <span>Find your campus</span>
              <GraduationCap size={19} strokeWidth={1.5} />
            </div>
            {universities.status === "ready" ? (
              <p className={styles.campusCount}>
                <strong>{universities.data?.length ?? 0}</strong>
                <span>
                  {universities.data?.length === 1
                    ? "university"
                    : "universities"}
                  <br />
                  to explore
                </span>
              </p>
            ) : (
              <p className={styles.widgetTitle}>
                {universities.status === "loading"
                  ? "Finding your campus…"
                  : "Discover your campus"}
              </p>
            )}
            <div className={styles.widgetAction}>
              Closer to campus
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>

      <HeroSearch universities={universities} />
    </section>
  );
}
