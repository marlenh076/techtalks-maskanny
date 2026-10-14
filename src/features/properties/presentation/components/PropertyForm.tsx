"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { propertySchema } from "@/src/features/properties/validation/property.schema";
import type {
  Property,
  PropertyCreate,
} from "@/src/features/properties/models/property.model";
import { supabase } from "@/src/lib/supabase/client";

type PropertyFormPayload = Omit<PropertyCreate, "host_id">;

type SelectedLocation = Pick<Property, "address" | "latitude" | "longitude">;

type FormValues = {
  propertyType: string;
  title: string;
  description: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  bedCount: string;
  gender: string;
  furnished: string;
  electricityIncluded: string;
  kitchenType: string;
  bathroomType: string;
};

type Option = {
  value: string;
  label: string;
};

type Feedback = {
  type: "error" | "success";
  message: string;
};

const INITIAL_VALUES: FormValues = {
  propertyType: "",
  title: "",
  description: "",
  address: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  bedCount: "",
  gender: "",
  furnished: "",
  electricityIncluded: "",
  kitchenType: "",
  bathroomType: "",
};

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const GRID_CLASSES =
  "grid grid-cols-2 gap-x-[24px] gap-y-[26px] [@media(width<=700px)]:grid-cols-1";

const INPUT_CLASSES = `
  block w-full min-h-[52px] appearance-none
  rounded-(--radius-sm) border border-transparent
  bg-(--bg) px-[16px] py-[14px] text-[14px]! text-(--ink)
  transition-[background,border-color,box-shadow]
  duration-(--duration-fast) ease-[ease]
  placeholder:text-(--faint)
  hover:border-(--line-strong)
  focus:border-(--ink) focus:bg-(--surface)
  focus:shadow-[0_0_0_3px_rgba(22,23,26,0.045)]
  focus:outline-none
`;

function buildPayload(
  values: FormValues,
  location: SelectedLocation | null,
): PropertyFormPayload {
  if (!values.propertyType) throw new Error("Select a property type.");
  if (!values.title.trim()) throw new Error("Property title is required.");
  if (!values.address.trim()) throw new Error("Property address is required.");
  if (!location || location.address !== values.address.trim()) {
    throw new Error("Confirm the property location before submitting.");
  }
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    Math.abs(location.latitude) > 90 ||
    Math.abs(location.longitude) > 180 ||
    (location.latitude === 0 && location.longitude === 0)
  ) {
    throw new Error("Select a valid property location.");
  }

  for (const [field, label] of [
    ["price", "Monthly price"],
    ["bedrooms", "Bedrooms"],
    ["bathrooms", "Bathrooms"],
    ["bedCount", "Bed count"],
  ] as const) {
    if (!values[field].trim()) throw new Error(`${label} is required.`);
  }

  if (
    !["true", "false"].includes(values.furnished) ||
    !["true", "false"].includes(values.electricityIncluded)
  ) {
    throw new Error("Select the furnished and electricity options.");
  }
  if (!values.kitchenType || !values.bathroomType || !values.gender) {
    throw new Error("Complete the kitchen, bathroom, and gender options.");
  }

  const result = propertySchema.safeParse({
    property_type: values.propertyType,
    title: values.title.trim(),
    description: values.description.trim() || null,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
    price: Number(values.price),
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    bed_count: Number(values.bedCount),
    furnished: values.furnished === "true",
    electricity_included: values.electricityIncluded === "true",
    kitchen_type: values.kitchenType,
    bathroom_type: values.bathroomType,
    gender: values.gender,
  });

  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ?? "Check the property details.",
    );
  }

  return result.data;
}

async function readApiError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error;
    if (typeof error === "string") return error;
  }
  return `Request failed (${response.status}).`;
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="
        border-b border-(--line) bg-(--surface)
        px-[44px] py-[42px] last-of-type:border-b-0
        [@media(700px<width<=900px)]:px-[32px]
        [@media(700px<width<=900px)]:py-[36px]
        [@media(480px<width<=700px)]:px-[24px]
        [@media(480px<width<=700px)]:py-[30px]
        [@media(width<=480px)]:px-[20px]
        [@media(width<=480px)]:py-[26px]
      "
    >
      <div
        className="
          mb-[34px] flex items-start gap-[18px]
          [@media(width<=480px)]:mb-[28px]
          [@media(width<=480px)]:gap-[14px]
        "
      >
        <span
          className="
            grid size-[38px] flex-none place-items-center
            rounded-(--radius-full) bg-(--ink)
            text-[12px] font-semibold text-white
            [@media(width<=480px)]:size-[34px]
          "
        >
          {number}
        </span>

        <div>
          <h2 className="m-0 text-[26px] leading-[1.15] font-medium tracking-[-0.025em]">
            {title}
          </h2>
          <p className="mt-[7px] mb-0 text-[13px] leading-[1.55] text-(--soft)">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

type FormFieldProps = {
  id: keyof FormValues;
  label: string;
  value: string;
  onChange: (id: keyof FormValues, value: string) => void;
  placeholder: string;
  type?: "text" | "number";
  options?: Option[];
  multiline?: boolean;
  fullWidth?: boolean;
  min?: string;
  step?: string;
  disabled?: boolean;
};

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  options,
  multiline = false,
  fullWidth = false,
  min,
  step,
  disabled = false,
}: FormFieldProps) {
  const fieldProps = {
    id,
    value,
    disabled,
    onChange: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => onChange(id, event.target.value),
  };

  return (
    <div
      className={`min-w-0 ${
        fullWidth ? "col-span-full [@media(width<=700px)]:col-auto" : ""
      }`}
    >
      <label
        htmlFor={id}
        className="mt-0! mb-[9px]! text-[14px]! text-(--ink-2)!"
      >
        {label}
      </label>

      {options ? (
        <select {...fieldProps} className={`${INPUT_CLASSES} cursor-pointer`}>
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          {...fieldProps}
          placeholder={placeholder}
          className={`${INPUT_CLASSES} min-h-[132px]! resize-y leading-[1.6]!`}
        />
      ) : (
        <input
          {...fieldProps}
          type={type}
          min={min ?? (type === "number" ? "0" : undefined)}
          step={step}
          placeholder={placeholder}
          className={INPUT_CLASSES}
        />
      )}

    </div>
  );
}
/* eslint-disable @next/next/no-img-element -- Local file preview uses a browser blob URL. */
function PhotoPreview({
  photo,
  index,
  onRemove,
  disabled,
}: {
  photo: File;
  index: number;
  onRemove: () => void;
  disabled: boolean;
}) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(photo);

    if (imageRef.current) {
      imageRef.current.src = url;
    }

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return (
    <div
      className="
        group relative aspect-[4/3] overflow-hidden
        rounded-[20px] bg-(--placeholder-bg)
        shadow-[0_0_0_1px_var(--line)]
      "
    >
      <img
        ref={imageRef}
        alt={`Property preview ${index + 1}`}
        className="
          block h-full w-full object-cover
          transition-transform duration-[300ms] ease-(--ease-out)
          group-hover:[transform:scale(1.03)]
        "
      />

      {index === 0 && (
        <span
          className="
            absolute top-[12px] left-[12px]
            rounded-[999px] bg-white/92 px-[12px] py-[7px]
            text-[11px] font-semibold text-(--ink) backdrop-blur-[8px]
          "
        >
          Cover photo
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${photo.name}`}
        className="
          absolute top-[12px] right-[12px]
          grid size-[34px] cursor-pointer place-items-center
          rounded-[50%] [border:0] bg-[rgba(22,23,26,0.82)] p-0
          text-[20px]! leading-none! font-light! text-white
          backdrop-blur-[8px]
          transition-[background,transform] duration-[200ms] ease-[ease]
          hover:bg-(--ink) hover:[transform:scale(1.06)]
          focus-visible:outline-2 focus-visible:outline-solid
          focus-visible:outline-(--ink) focus-visible:outline-offset-[3px]
        "
      >
        ×
      </button>
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */
export default function PropertyForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [uploadedPhotoCount, setUploadedPhotoCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const fieldsLocked = isSubmitting || createdPropertyId !== null;

  function updateField(id: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
    if (id === "address") setSelectedLocation(null);
    setFeedback(null);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);

    if (selected.some((file) => !IMAGE_TYPES.includes(file.type))) {
      setFeedback({ type: "error", message: "Choose JPG, PNG, or WEBP images only." });
    } else if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      setFeedback({ type: "error", message: "Each photo must be 50 MB or smaller." });
    } else if (photos.length + selected.length > MAX_IMAGES) {
      setFeedback({ type: "error", message: "You can upload up to 6 photos." });
    } else {
      setPhotos((current) => [...current, ...selected]);
      setFeedback(null);
    }
    event.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index),
    );
  }

  function confirmLocation(
    address: string,
    latitude: number,
    longitude: number,
  ) {
    setSelectedLocation({ address, latitude, longitude });
    setFeedback(null);
  }

  function useCurrentLocation() {
    const address = values.address.trim();
    if (!address) {
      setFeedback({
        type: "error",
        message: "Enter the property address first.",
      });
      return;
    }
    if (!navigator.geolocation) {
      setFeedback({
        type: "error",
        message: "Browser location is unavailable.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        confirmLocation(address, coords.latitude, coords.longitude);
      },
      () => {
        setIsLocating(false);
        setFeedback({
          type: "error",
          message: "Could not get your location. Allow location access and try again.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isComplete) return;

    let payload: PropertyFormPayload | null = null;
    if (!createdPropertyId) {
      try {
        payload = buildPayload(values, selectedLocation);
      } catch (error) {
        setFeedback({
          type: "error",
          message:
            error instanceof Error ? error.message : "Check the property details.",
        });
        return;
      }
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error("Sign in as a Host before creating a listing.");
      }

      const headers = { Authorization: `Bearer ${session.access_token}` };
      let propertyId = createdPropertyId;

      if (!propertyId && payload) {
        const response = await fetch("/api/properties", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(await readApiError(response));

        const created: unknown = await response.json();
        if (
          !created ||
          typeof created !== "object" ||
          !("property_id" in created) ||
          typeof created.property_id !== "string"
        ) {
          throw new Error(
            "Property was created, but its ID was missing from the response. Check your listings before trying again.",
          );
        }
        propertyId = created.property_id;
        setCreatedPropertyId(propertyId);
      }

      if (!propertyId) throw new Error("The property could not be created.");

      for (let index = uploadedPhotoCount; index < photos.length; index += 1) {
        const formData = new FormData();
        formData.append("file", photos[index]);
        const response = await fetch(`/api/properties/${propertyId}/media`, {
          method: "POST",
          headers,
          body: formData,
        });
        if (!response.ok) {
          throw new Error(
            `Property ${propertyId} was created, but photo ${index + 1} failed: ${await readApiError(response)} Retry to upload the remaining photos.`,
          );
        }
        setUploadedPhotoCount(index + 1);
      }

      setIsComplete(true);
      setFeedback({
        type: "success",
        message: `Property ${propertyId} was created with ${photos.length} ${photos.length === 1 ? "photo" : "photos"}. It is pending Admin review.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not create the listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldProps = { onChange: updateField, disabled: fieldsLocked };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        mx-auto my-0 w-full max-w-[1040px] overflow-hidden
        rounded-(--radius-xl) border border-(--line) bg-(--surface)
        shadow-[0_1px_2px_rgba(22,23,26,0.02),0_24px_70px_-45px_rgba(22,23,26,0.3)]
        [@media(width<=700px)]:rounded-[24px]
      "
    >
      <FormSection
        number="01"
        title="Property information"
        description="Start with the essential details students will see first."
      >
        <div className={GRID_CLASSES}>
          <FormField
            {...fieldProps}
            id="title"
            label="Property title"
            value={values.title}
            placeholder="e.g. Hamra Student Residence"
          />
          <FormField
            {...fieldProps}
            id="propertyType"
            label="Property type"
            value={values.propertyType}
            placeholder="Select property type"
            options={[
              { value: "dorm", label: "Dorm" },
              { value: "studio", label: "Studio" },
              { value: "apartment", label: "Apartment" },
            ]}
          />
          <FormField
            {...fieldProps}
            id="description"
            label="Description (optional)"
            value={values.description}
            placeholder="Describe the property and what makes it a good fit for students..."
            multiline
            fullWidth
          />
        </div>
      </FormSection>

      <FormSection
        number="02"
        title="Location"
        description="Help students understand where the property is located."
      >
        <div className={GRID_CLASSES}>
          <FormField
            {...fieldProps}
            id="address"
            label="Property address"
            value={values.address}
            placeholder="e.g. Hamra Street, Beirut"
            fullWidth
          />
        </div>
        <div className="mt-[18px] flex flex-wrap items-center gap-[14px]">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={fieldsLocked || isLocating}
            className="cursor-pointer rounded-(--radius-full) border border-(--line-strong) bg-(--surface) px-[18px] py-[10px] text-[13px] font-medium text-(--ink) hover:border-(--ink) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLocating ? "Locating..." : "I am at the property — use my location"}
          </button>
          <p className="m-0 text-[13px] text-(--soft)">
            {selectedLocation && selectedLocation.address === values.address.trim()
              ? "Device coordinates captured. Check that the address describes this property."
              : "Location coordinates are required. Use device location only while at the property; a map picker for remote properties is not connected yet."}
          </p>
        </div>
      </FormSection>

      <FormSection
        number="03"
        title="Pricing & accommodation"
        description="Add the price and accommodation details students compare."
      >
        <div className={GRID_CLASSES}>
          <FormField
            {...fieldProps}
            id="price"
            label="Monthly price ($)"
            value={values.price}
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 250"
          />
          <FormField
            {...fieldProps}
            id="bedrooms"
            label="Bedrooms"
            value={values.bedrooms}
            type="number"
            step="1"
            placeholder="e.g. 2"
          />
          <FormField
            {...fieldProps}
            id="bathrooms"
            label="Bathrooms"
            value={values.bathrooms}
            type="number"
            step="1"
            placeholder="e.g. 1"
          />
          <FormField
            {...fieldProps}
            id="bedCount"
            label="Beds"
            value={values.bedCount}
            type="number"
            step="1"
            placeholder="e.g. 3"
          />
        </div>
      </FormSection>

      <FormSection
        number="04"
        title="Property details"
        description="Describe the facilities and who the property is suitable for."
      >
        <div className={GRID_CLASSES}>
          <FormField
            {...fieldProps}
            id="furnished"
            label="Furnished"
            value={values.furnished}
            placeholder="Select"
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
          />
          <FormField
            {...fieldProps}
            id="electricityIncluded"
            label="Electricity included"
            value={values.electricityIncluded}
            placeholder="Select"
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
          />
          <FormField
            {...fieldProps}
            id="kitchenType"
            label="Kitchen type"
            value={values.kitchenType}
            placeholder="Select kitchen type"
            options={[
              { value: "private", label: "Private" },
              { value: "shared", label: "Shared" },
            ]}
          />
          <FormField
            {...fieldProps}
            id="bathroomType"
            label="Bathroom type"
            value={values.bathroomType}
            placeholder="Select bathroom type"
            options={[
              { value: "private", label: "Private" },
              { value: "shared", label: "Shared" },
            ]}
          />
          <FormField
            {...fieldProps}
            id="gender"
            label="Suitable for"
            value={values.gender}
            placeholder="Select"
            options={[
              { value: "boys", label: "Boys" },
              { value: "girls", label: "Girls" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
        </div>
      </FormSection>

      <FormSection
        number="05"
        title="Property photos"
        description="Add clear photos to help students get a better feel for the property."
      >
        <div className="mt-[28px] w-full">
          <input
            id="propertyPhotos"
            className="peer sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            disabled={fieldsLocked}
            onChange={handlePhotoChange}
          />

          <label
            htmlFor="propertyPhotos"
            className="
              group m-0! flex! min-h-[220px] w-full cursor-pointer
              flex-col items-center justify-center gap-[8px]
              rounded-[24px] border border-dashed
              border-(--line-strong) bg-(--bg)
              px-[24px] py-[36px] text-center
              transition-[background,border-color,transform]
              duration-[200ms] ease-[ease]
              hover:border-(--ink) hover:bg-(--chip)
              peer-focus-visible:outline-2 peer-focus-visible:outline-solid
              peer-focus-visible:outline-(--ink)
              peer-focus-visible:outline-offset-[3px]
              [@media(480px<width<=800px)]:min-h-[190px]
              [@media(width<=480px)]:min-h-[180px]
              [@media(width<=480px)]:px-[18px]
              [@media(width<=480px)]:py-[28px]
            "
          >
            <span
              aria-hidden="true"
              className="
                mb-[6px] flex size-[48px] items-center justify-center
                rounded-[50%] bg-(--ink) pb-[2px]
                text-[22px] leading-none font-light text-white
              "
            >
              +
            </span>

            <span className="block text-[16px] font-semibold tracking-[-0.01em] text-(--ink)">
              Add property photos
            </span>

            <span className="block text-[13px] leading-[1.5] text-(--soft)">
              Choose JPG, PNG or WEBP images
            </span>

            <span
              className="
                mt-[10px] inline-flex items-center justify-center
                rounded-[999px] border border-[rgba(22,23,26,0.12)]
                bg-(--surface) px-[18px] py-[10px]
                text-[13px] font-medium text-(--ink)
                transition-[border-color,background] duration-[200ms] ease-[ease]
                group-hover:border-(--ink)
              "
            >
              Choose photos
            </span>
          </label>
        </div>

        {photos.length > 0 && (
          <>
            <div
              className="
                mt-[18px] grid grid-cols-3 gap-[14px]
                [@media(480px<width<=800px)]:grid-cols-2
                [@media(width<=480px)]:grid-cols-1
              "
            >
              {photos.map((photo, index) => (
                <PhotoPreview
                  key={`${photo.name}-${index}`}
                  photo={photo}
                  index={index}
                  onRemove={() => removePhoto(index)}
                  disabled={fieldsLocked}
                />
              ))}
            </div>

            <p className="mx-[2px] mt-[12px] mb-0 text-[12px] text-(--soft)">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}{" "}
              selected (maximum 6)
            </p>
          </>
        )}
      </FormSection>

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`
            mx-[40px] mt-[24px] mb-0 flex items-center gap-[12px]
            rounded-[14px] border px-[18px] py-[16px]
            text-[13px] leading-[1.5]
            [@media(480px<width<=700px)]:mx-[24px]
            [@media(480px<width<=700px)]:mt-[20px]
            [@media(width<=480px)]:mx-[20px]
            [@media(width<=480px)]:mt-[18px]
            ${
              feedback.type === "error"
                ? "border-[rgba(138,59,50,0.12)] bg-(--danger-bg) text-(--danger)"
                : "border-[rgba(64,93,69,0.12)] bg-(--success-bg) text-(--success)"
            }
          `}
        >
          <span aria-hidden="true">
            {feedback.type === "error" ? "!" : "✓"}
          </span>
          <p>{feedback.message}</p>
        </div>
      )}

      <div
        className="
          flex items-center justify-between gap-[24px]
          border-t border-(--line) bg-(--bg) px-[40px] py-[30px]
          [@media(width<=700px)]:flex-col
          [@media(width<=700px)]:items-stretch
          [@media(480px<width<=700px)]:px-[24px]
          [@media(480px<width<=700px)]:py-[26px]
          [@media(width<=480px)]:px-[20px]
          [@media(width<=480px)]:py-[24px]
        "
      >
        <div>
          <p>Ready to submit for review?</p>
          <p className="text-[13px] leading-[1.5] text-(--soft)">
            Your property will remain pending until Admin approval.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isComplete || isLocating}
          className="
            inline-flex min-w-[160px] cursor-pointer
            items-center justify-center gap-[12px]
            rounded-(--radius-full) [border:0]
            bg-(--ink) px-[22px] py-[14px]
            text-[14px]! font-medium! whitespace-nowrap text-white
            transition-[background,transform]
            duration-(--duration-fast) ease-[ease]
            hover:bg-(--btn-bg-hover) hover:[transform:translateY(-1px)]
            active:[transform:translateY(0)]
            focus-visible:outline-2 focus-visible:outline-solid
            focus-visible:outline-(--ink) focus-visible:outline-offset-[3px]
            [@media(width<=700px)]:w-full
            motion-reduce:transition-none motion-reduce:transform-none
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {isComplete
            ? "Submitted"
            : isSubmitting
              ? "Submitting..."
              : createdPropertyId
                ? "Retry photo uploads"
                : "Create listing"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
