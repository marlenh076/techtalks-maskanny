"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PropertySelect } from "@/src/features/properties/presentation/components/PropertySelect";
import type { UniversitiesResource } from "@/src/features/universities/presentation/useUniversities";
import styles from "./MarketplaceHero.module.css";

type Filters = {
  university_id: string;
  property_type: string;
  max_price: string;
};

function SearchForm({
  universities,
  values,
  onChange,
  onSubmit,
  pending,
  mobile = false,
}: {
  universities: UniversitiesResource;
  values: Filters;
  onChange: (field: keyof Filters, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  mobile?: boolean;
}) {
  const prefix = mobile ? "hero-mobile" : "hero";
  return (
    <form
      className={`${styles.searchForm} ${mobile ? styles.dialogForm : styles.desktopSearch}`}
      aria-label={
        mobile ? "Mobile student housing search" : "Find student housing"
      }
      action="/properties"
      method="get"
      aria-busy={pending}
      onSubmit={onSubmit}
    >
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-university`}>University</label>
          <PropertySelect
            id={`${prefix}-university`}
            name="university_id"
            value={values.university_id}
            onChange={(event) => onChange("university_id", event.target.value)}
            disabled={universities.status !== "ready"}
            aria-describedby={
              universities.status === "error"
                ? `${prefix}-university-error`
                : undefined
            }
          >
            <option value="">
              {universities.status === "loading"
                ? "Loading universities…"
                : universities.status === "error"
                  ? "Universities unavailable"
                  : "Any university"}
            </option>
            {universities.data?.map((university) => (
              <option
                key={university.university_id}
                value={university.university_id}
              >
                {university.name}
              </option>
            ))}
          </PropertySelect>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-property-type`}>Property type</label>
          <PropertySelect
            id={`${prefix}-property-type`}
            name="property_type"
            value={values.property_type}
            onChange={(event) => onChange("property_type", event.target.value)}
          >
            <option value="">Any type</option>
            <option value="dorm">Dorm</option>
            <option value="studio">Studio</option>
            <option value="apartment">Apartment</option>
          </PropertySelect>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-budget`}>Monthly budget</label>
          <div className={styles.budget}>
            <span aria-hidden="true">$</span>
            <input
              id={`${prefix}-budget`}
              name="max_price"
              type="number"
              min="0"
              step="1"
              placeholder="No maximum"
              aria-label="Maximum monthly budget in USD"
              value={values.max_price}
              onChange={(event) => onChange("max_price", event.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className={styles.searchButton}
          disabled={pending}
          aria-label={pending ? "Searching…" : "Search student housing"}
        >
          <Search size={21} aria-hidden="true" />
          <span className={styles.searchText}>
            {pending ? "Searching…" : "Search"}
          </span>
        </button>
      </div>
      {universities.status === "error" && (
        <p
          id={`${prefix}-university-error`}
          role="status"
          className={styles.error}
        >
          Universities couldn&apos;t load.{" "}
          <button type="button" onClick={universities.retry}>
            Try again
          </button>{" "}
          or search by type and budget.
        </p>
      )}
    </form>
  );
}

export function HeroSearch({
  universities,
}: {
  universities: UniversitiesResource;
}) {
  const router = useRouter();
  const [pending, startNavigation] = useTransition();
  const [values, setValues] = useState<Filters>({
    university_id: "",
    property_type: "",
    max_price: "",
  });
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      const bottom = Math.max(
        0,
        window.innerHeight - height - (viewport?.offsetTop ?? 0),
      );
      dialog.current?.style.setProperty(
        "--search-viewport-height",
        `${height}px`,
      );
      dialog.current?.style.setProperty(
        "--search-viewport-bottom",
        `${bottom}px`,
      );
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.current?.close();
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value.trim())
        params.set(key, value.trim());
    }
    dialog.current?.close();
    startNavigation(() =>
      router.push(`/properties${params.size ? `?${params}` : ""}`),
    );
  };
  const formProps = {
    universities,
    values,
    pending,
    onSubmit,
    onChange: (field: keyof Filters, value: string) =>
      setValues((current) => ({ ...current, [field]: value })),
  };

  return (
    <>
      <SearchForm {...formProps} />
      <button
        ref={trigger}
        type="button"
        className={styles.mobileSearchPill}
        aria-label="Find student housing"
        aria-haspopup="dialog"
        aria-controls="hero-mobile-search-dialog"
        aria-expanded={open}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <Search size={21} aria-hidden="true" />
        <span className={styles.mobileSearchCopy}>
          <strong>Find student housing</strong>
          <span>University · Type · Budget</span>
        </span>
        <span className={styles.mobileFilterIcon}>
          <SlidersHorizontal size={18} aria-hidden="true" />
        </span>
      </button>
      <dialog
        ref={dialog}
        id="hero-mobile-search-dialog"
        aria-labelledby="hero-search-dialog-title"
        className={styles.mobileDialog}
        onClose={() => {
          setOpen(false);
          if (trigger.current?.getClientRects().length)
            trigger.current.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), select:not(:disabled), input:not(:disabled)",
            ),
          ).filter((element) => element.getClientRects().length);
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            event.currentTarget.close();
        }}
      >
        <div className={styles.dialogHeader}>
          <h2 id="hero-search-dialog-title">Find student housing</h2>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        <SearchForm {...formProps} mobile />
      </dialog>
    </>
  );
}
