"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { z } from "zod";
import { CheckCircle2, MapPin, Search, LocateFixed } from "lucide-react";
import { propertySchema } from "../../validation/property.schema";
import type { Coordinates } from "./PropertyMap";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="grid h-[360px] place-items-center rounded-(--radius-sm) bg-(--bg) text-sm text-(--soft) max-[480px]:h-[280px]"
    >
      Loading map…
    </div>
  ),
});

const BUTTON =
  "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-(--radius-full) border border-(--line-strong) bg-(--surface) px-[18px] py-[10px] text-[13px]! font-medium! text-(--ink) hover:border-(--ink) focus-visible:outline-2 focus-visible:outline-(--ink) focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50";
type SearchResult = Coordinates & { address: string };
const searchResponseSchema = z.object({
  results: z.array(
    propertySchema.pick({
      address: true,
      latitude: true,
      longitude: true,
    }),
  ),
});

export default function PropertyLocationPicker({
  address,
  position,
  confirmed,
  disabled,
  searchEnabled,
  error,
  onSelect,
  onConfirm,
  onAddress,
  onUnconfirm,
}: {
  address: string;
  position: Coordinates | null;
  confirmed: boolean;
  disabled: boolean;
  searchEnabled: boolean;
  error?: string;
  onSelect: (point: Coordinates) => void;
  onConfirm: () => void;
  onAddress: (address: string) => void;
  onUnconfirm: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultAddress, setResultAddress] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState<string | null>(null);
  const operation = useRef(0);

  function beginOperation() {
    setIsLocating(false);
    setIsSearching(false);
    setMessage(null);
    setResults([]);
    return ++operation.current;
  }

  function select(point: Coordinates) {
    operation.current += 1;
    setIsLocating(false);
    setIsSearching(false);
    setMessage(null);
    onSelect(point);
  }

  function locate() {
    onUnconfirm();
    const current = beginOperation();
    if (!navigator.geolocation) {
      setMessage("Browser location is unavailable. Select the property on the map.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (current !== operation.current) return;
        select({ latitude: coords.latitude, longitude: coords.longitude });
      },
      (failure) => {
        if (current !== operation.current) return;
        setIsLocating(false);
        setMessage(
          failure.code === 1
            ? "Location permission denied. Select the property on the map instead."
            : "Could not get your current location. Select the property on the map or try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function search() {
    onUnconfirm();
    const current = beginOperation();
    const query = address.trim();
    if (query.length < 3) {
      setMessage("Enter at least three characters of the address to search.");
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/properties/location-search?q=${encodeURIComponent(query)}`,
      );
      const body: unknown = await response.json();
      if (current !== operation.current) return;
      if (!response.ok) {
        const error =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Address search failed. Select the property on the map.";
        throw new Error(error);
      }
      const parsed = searchResponseSchema.safeParse(body);
      if (!parsed.success)
        throw new Error(
          "Address search returned an invalid response. Select the property on the map or try again.",
        );
      setResults(parsed.data.results);
      setResultAddress(query);
      if (!parsed.data.results.length)
        setMessage("No addresses found. Select the property on the map.");
    } catch (failure) {
      if (current === operation.current)
        setMessage(
          failure instanceof Error
            ? failure.message
            : "Address search is unavailable. Select the property on the map.",
        );
    } finally {
      if (current === operation.current) setIsSearching(false);
    }
  }

  return (
    <div className="mt-[18px] space-y-[16px]">
      <div className="flex flex-wrap gap-[10px] max-[480px]:flex-col">
        {searchEnabled && (
          <button
            type="button"
            className={BUTTON}
            disabled={disabled || isSearching}
            onClick={search}
          >
            <Search aria-hidden="true" size={16} />
            {isSearching ? "Searching…" : "Search address"}
          </button>
        )}
        <button type="button" className={BUTTON} disabled={disabled || isLocating} onClick={locate}>
          <LocateFixed aria-hidden="true" size={16} />
          {isLocating ? "Locating…" : "Use my current location"}
        </button>
      </div>
      <div className="space-y-1.5 text-[13px] leading-[1.6] text-(--soft)">
        <p id="location-instructions" className="m-0">
          Click the map to place a pin, or drag the pin to the property entrance. Check the address
          above, then confirm below.
        </p>
        <p id="location-keyboard-help" className="m-0 text-[12px]">
          Use current location only while at the property. With a keyboard, focus the map, move with
          arrow keys and press Enter to place the pin.
        </p>
      </div>
      {results.length > 0 && resultAddress === address.trim() && (
        <ul aria-label="Address search results" className="space-y-2">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                disabled={disabled}
                className={`${BUTTON} w-full justify-start! rounded-(--radius-sm)! text-left`}
                onClick={() => {
                  onAddress(result.address);
                  select(result);
                  setResults([]);
                }}
              >
                <MapPin aria-hidden="true" size={16} className="shrink-0" />
                {result.address}
              </button>
            </li>
          ))}
        </ul>
      )}
      <PropertyMap position={position} disabled={disabled} onSelect={select} />
      <div
        className={`flex items-start justify-between gap-4 rounded-(--radius-sm) border p-4 max-[700px]:flex-col ${confirmed ? "border-(--success)/20 bg-(--success-bg)" : "border-(--line-strong) bg-(--bg)"}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          {confirmed ? (
            <CheckCircle2
              aria-hidden="true"
              size={20}
              className="mt-0.5 shrink-0 text-(--success)"
            />
          ) : (
            <MapPin aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-(--soft)" />
          )}
          <div className="min-w-0 space-y-1.5">
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`m-0 text-[13px] leading-6 font-medium ${confirmed ? "text-(--success)" : "text-(--ink)"}`}
            >
              {position
                ? `${confirmed ? "Location confirmed" : "Location not confirmed"}: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
                : "No property location selected."}
            </p>
            <p id="location-confirmation-help" className="m-0 text-[12px] leading-5 text-(--soft)">
              {confirmed
                ? "The address and map pin are ready for submission."
                : confirmedAddress !== null && confirmedAddress !== address.trim()
                  ? "Address changed. Check the map pin and confirm again."
                  : confirmedAddress !== null
                    ? "Location needs reconfirmation. Check the map pin and confirm again."
                    : position
                      ? address.trim()
                        ? "Check that this pin matches the address, then confirm."
                        : "Add the property address above to confirm this pin."
                      : "Select a location on the map to continue."}
            </p>
          </div>
        </div>
        <button
          id="confirm-location"
          type="button"
          aria-describedby={`location-confirmation-help${error ? " location-error" : ""}`}
          className="inline-flex min-h-[48px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-(--radius-full) border-0 bg-(--ink) px-5 py-3 text-[13px]! font-medium! text-white hover:bg-(--btn-bg-hover) focus-visible:outline-2 focus-visible:outline-(--ink) focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50 max-[700px]:w-full"
          disabled={
            disabled || confirmed || !position || !address.trim() || isLocating || isSearching
          }
          onClick={() => {
            setConfirmedAddress(address.trim());
            onConfirm();
          }}
        >
          Confirm location
        </button>
      </div>
      {message && (
        <p
          role="alert"
          className="rounded-(--radius-sm) bg-(--danger-bg) px-4 py-3 text-[13px] leading-6 text-(--danger)"
        >
          {message}
        </p>
      )}
      {error && (
        <p id="location-error" role="alert" className="text-[13px] leading-6 text-(--danger)">
          {error}
        </p>
      )}
      {searchEnabled && (
        <p className="text-[12px] leading-5 text-(--soft)">
          Address search powered by{" "}
          <a
            className="underline! underline-offset-2 focus-visible:outline-2 focus-visible:outline-(--ink)"
            href="https://www.geoapify.com/"
            target="_blank"
            rel="noreferrer"
          >
            Geoapify
          </a>
          . Search addresses are sent to Geoapify.
        </p>
      )}
    </div>
  );
}
