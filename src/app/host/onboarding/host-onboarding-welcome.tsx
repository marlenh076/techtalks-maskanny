import Image from "next/image";
import { HousePlus, Images, UsersRound } from "lucide-react";
import { HostOnboardingButton } from "./host-onboarding-button";
import styles from "./host-onboarding.module.css";

const benefits = [
  { icon: HousePlus, text: "Create your property listing." },
  { icon: Images, text: "Add photos and property details." },
  { icon: UsersRound, text: "Make your listing available to students." },
];

export function HostOnboardingWelcome({ accessError = false }: { accessError?: boolean }) {
  return (
    <main className={`student-marketplace ${styles.page}`}>
      <div className={styles.layout}>
        <section className={styles.content} aria-labelledby="host-welcome-title">
          <p className={styles.eyebrow}>Hosting on Maskanny</p>
          <h1 id="host-welcome-title">Your space could be someone&apos;s next home.</h1>
          <p className={styles.description}>List your property and help students find a place near campus.</p>
          <ul className={styles.benefits}>
            {benefits.map(({ icon: Icon, text }) => <li key={text}><span aria-hidden="true"><Icon size={19} strokeWidth={1.75} /></span><p>{text}</p></li>)}
          </ul>
          {accessError ? <p role="alert" className={styles.error}>We couldn&apos;t check your Host access. Refresh and try again.</p> : <HostOnboardingButton />}
        </section>
        <figure className={styles.photograph}>
          <div className={styles.imageFrame}><Image src="/images/host-onboarding-apartment.jpg" alt="Bright apartment interior with a comfortable sofa, plants, and a dining area" fill sizes="(max-width: 767px) 0px, (max-width: 1280px) 46vw, 550px" className={styles.image} /></div>
        </figure>
      </div>
    </main>
  );
}
