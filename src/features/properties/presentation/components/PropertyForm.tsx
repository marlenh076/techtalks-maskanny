"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { propertySchema } from "@/src/features/properties/validation/property.schema";
import type {
  Property,
  PropertyCreate,
} from "@/src/features/properties/models/property.model";
import { supabase } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import PropertyCreateSelect, { type PropertySelectOption } from "./PropertySelect";
import PropertyLocationPicker from "./PropertyLocationPicker";
import PropertyUniversitySelect from "./PropertyUniversitySelect";
import type { University } from "@/src/features/universities/models/university.model";
import { propertyUniversitiesSchema } from "../../validation/property-universities.schema";
import type { Coordinates } from "./PropertyMap";
import {
  MAX_PROPERTY_IMAGES as MAX_IMAGES,
  MAX_PROPERTY_IMAGE_FILE_SIZE as MAX_FILE_SIZE,
  PROPERTY_IMAGE_TYPES as IMAGE_TYPES,
} from "../../validation/media-limits";


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

type Option = PropertySelectOption;

type Feedback = {
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

type FieldErrors = Partial<
  Record<keyof FormValues | "location" | "photos" | "universities", string>
>;
class FormValidationError extends Error {
  constructor(public fields: FieldErrors) {
    super("Check the highlighted fields before submitting.");
  }
}

const GRID_CLASSES =
  "grid grid-cols-2 gap-x-[24px] gap-y-[26px] [@media(width<=700px)]:grid-cols-1";

const INPUT_CLASSES = `
  block w-full min-h-[52px] appearance-none
  rounded-(--radius-sm) border border-transparent
  bg-(--bg) px-[16px] py-[14px] text-[16px]! text-(--ink)
  transition-[background,border-color,box-shadow]
  duration-(--duration-fast) ease-[ease]
  placeholder:text-(--faint)
  hover:border-(--line-strong)
  focus:border-(--ink) focus:bg-(--surface)
  focus:shadow-[0_0_0_3px_rgba(22,23,26,0.045)]
  focus:outline-none
  disabled:cursor-not-allowed disabled:opacity-70
  motion-reduce:transition-none
`;

function buildPayload(
  values: FormValues,
  location: SelectedLocation | null,
): PropertyFormPayload {
  const errors: FieldErrors = {};
  if (!location || location.address !== values.address.trim())
    errors.location = "Confirm the property location before submitting.";
  const number = (value: string) => (value.trim() ? Number(value) : NaN);
  const boolean = (value: string) =>
    ["true", "false"].includes(value) ? value === "true" : undefined;
  const result = propertySchema.safeParse({
    property_type: values.propertyType,
    title: values.title.trim(),
    description: values.description.trim() || null,
    address: values.address.trim(),
    latitude: location?.latitude,
    longitude: location?.longitude,
    price: number(values.price),
    bedrooms: number(values.bedrooms),
    bathrooms: number(values.bathrooms),
    bed_count: number(values.bedCount),
    furnished: boolean(values.furnished),
    electricity_included: boolean(values.electricityIncluded),
    kitchen_type: values.kitchenType,
    bathroom_type: values.bathroomType,
    gender: values.gender,
  });

  if (!result.success) {
    const fieldNames: Record<string, keyof FieldErrors> = {
      property_type: "propertyType",
      bed_count: "bedCount",
      electricity_included: "electricityIncluded",
      kitchen_type: "kitchenType",
      bathroom_type: "bathroomType",
      latitude: "location",
      longitude: "location",
    };
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      const field = fieldNames[path] ?? (path as keyof FieldErrors);
      errors[field] ??= issue.message;
    }
  }
  for (const [field, label] of [
    ["price", "Monthly price"],
    ["bedrooms", "Bedrooms"],
    ["bathrooms", "Bathrooms"],
    ["bedCount", "Beds"],
  ] as const)
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  for (const [field, label] of [
    ["propertyType", "property type"],
    ["gender", "who the property is suitable for"],
    ["furnished", "a furnished option"],
    ["electricityIncluded", "an electricity option"],
    ["kitchenType", "a kitchen type"],
    ["bathroomType", "a bathroom type"],
  ] as const)
    if (!values[field]) errors[field] = `Select ${label}.`;
  if (Object.keys(errors).length || !result.success)
    throw new FormValidationError(errors);
  return result.data;
}

async function readApiError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error;
    if (typeof error === "string") return error;
    if (Array.isArray(error))
      return error.map((issue) => issue.message).join(" ");
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
        px-[40px] py-[36px] last-of-type:border-b-0
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
          mb-[26px] flex items-start gap-[16px]
          [@media(width<=480px)]:mb-[24px]
          [@media(width<=480px)]:gap-[14px]
        "
      >
        <span
          aria-hidden="true"
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
          <h2 className="m-0 text-[24px] leading-[1.25] font-medium tracking-[-0.025em] max-[480px]:text-[22px]">
            {title}
          </h2>
          <p className="mt-[7px] mb-0 text-[13px] leading-[1.55] text-(--soft)">
            {description}
          </p>
          {number === "01" && (
            <p className="mt-2 text-[12px] leading-5 text-(--soft)">
              All fields are required unless marked optional.
            </p>
          )}
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
  errors?: FieldErrors;
  hint?: string;
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
  errors = {},
  hint,
}: FormFieldProps) {
  const describedBy =
    [hint && `${id}-hint`, errors[id] && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  const inputClasses = `${INPUT_CLASSES} ${errors[id] ? "border-(--danger)! bg-(--danger-bg)!" : ""}`;
  const fieldProps = {
    id,
    value,
    disabled,
    "aria-invalid": Boolean(errors[id]),
    "aria-required": id !== "description",
    "aria-describedby": describedBy,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(id, event.target.value),
  };

  return (
    <div
      className={`min-w-0 ${
        fullWidth ? "col-span-full [@media(width<=700px)]:col-auto" : ""
      }`}
    >
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="mt-0! mb-[9px]! block text-[14px]! font-medium! text-(--ink-2)!"
      >
        {label}
      </label>

      {options ? (
        <PropertyCreateSelect
          id={id}
          label={label}
          value={value}
          placeholder={placeholder}
          options={options}
          invalid={Boolean(errors[id])}
          describedBy={describedBy}
          onValueChange={(value) => onChange(id, value)}
          disabled={disabled}
        />
      ) : multiline ? (
        <textarea
          {...fieldProps}
          placeholder={placeholder}
          className={`${inputClasses} min-h-[132px]! resize-y leading-[1.6]!`}
        />
      ) : (
        <input
          {...fieldProps}
          type={type}
          min={min ?? (type === "number" ? "0" : undefined)}
          step={step}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}

      {hint && (
        <p
          id={`${id}-hint`}
          className="mt-2 text-[12px] leading-5 text-(--soft)"
        >
          {hint}
        </p>
      )}
      {errors[id] && (
        <p
          id={`${id}-error`}
          className="mt-2 text-[13px] leading-5 text-(--danger)"
        >
          {errors[id]}
        </p>
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
  status,
  onCover,
}: {
  photo: File;
  index: number;
  onRemove: () => void;
  disabled: boolean;
  status: "ready" | "uploading" | "uploaded" | "failed";
  onCover: () => void;
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
    <figure className="m-0 min-w-0 overflow-hidden rounded-(--radius-sm) border border-(--line-strong) bg-(--surface)">
      <div className="relative aspect-[4/3] bg-(--placeholder-bg)">
        <img
          ref={imageRef}
          alt={`Property preview ${index + 1}`}
          className="block h-full w-full object-cover"
        />
        {index === 0 && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-(--radius-full) bg-(--surface) px-3 py-2 text-[12px] font-semibold text-(--ink)">
            <Check aria-hidden="true" size={14} />
            Cover photo
          </span>
        )}
      </div>
      <figcaption className="p-3">
        <p
          title={photo.name}
          className="truncate text-[13px] font-medium text-(--ink)"
        >
          {photo.name}
        </p>
        <p
          className={`mt-1 text-[12px] leading-5 ${status === "failed" ? "text-(--danger)" : status === "uploaded" ? "text-(--success)" : "text-(--soft)"}`}
        >
          {status === "uploaded"
            ? "Uploaded"
            : status === "uploading"
              ? "Uploading…"
              : status === "failed"
                ? "Upload failed · retry below"
                : "Ready to upload"}
        </p>
        <div className="mt-2 flex min-h-[44px] items-center justify-between gap-2">
          {index > 0 ? (
            <button
              type="button"
              onClick={onCover}
              disabled={disabled}
              aria-label={`Make cover: ${photo.name}`}
              className="min-h-[44px] rounded-(--radius-full) border border-(--line-strong) px-3 text-[12px]! font-medium! text-(--ink) hover:border-(--ink) focus-visible:outline-2 focus-visible:outline-(--ink) focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Make cover
            </button>
          ) : (
            <span className="text-[12px] text-(--soft)">Shown first</span>
          )}
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${photo.name}`}
            className="
              grid size-[44px] shrink-0 cursor-pointer place-items-center
              rounded-(--radius-full) border border-(--line-strong) bg-(--surface) p-0
              text-(--soft) hover:border-(--danger) hover:bg-(--danger-bg) hover:text-(--danger)
              focus-visible:outline-2 focus-visible:outline-solid
              focus-visible:outline-(--ink) focus-visible:outline-offset-[3px]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            <Trash2 aria-hidden="true" size={17} />
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
/* eslint-enable @next/next/no-img-element */
export default function PropertyForm({
  searchEnabled = false,
}: {
  searchEnabled?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesSaved, setUniversitiesSaved] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [draftLocation, setDraftLocation] = useState<Coordinates | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    null,
  );
  const [creationStarted, setCreationStarted] = useState(false);
  const [uploadedPhotoCount, setUploadedPhotoCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [failedPhotoIndex, setFailedPhotoIndex] = useState<number | null>(null);
  const [photoAnnouncement, setPhotoAnnouncement] = useState("");
  const submitting = useRef(false);
  const requestId = useRef<string | null>(null);
  const photoRequestIds = useRef(new WeakMap<File, string>());

  const fieldsLocked =
    isSubmitting || creationStarted || createdPropertyId !== null;

  useEffect(() => {
    if (!creationStarted || isComplete) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [creationStarted, isComplete]);

  function updateField(id: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
    if (id === "address") setSelectedLocation(null);
    setFeedback(null);
    setErrors((current) => ({
      ...current,
      [id]: undefined,
      ...(id === "address" ? { location: undefined } : {}),
    }));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);

    if (selected.some((file) => !IMAGE_TYPES.includes(file.type))) {
      setErrors((current) => ({
        ...current,
        photos: "Choose JPG, PNG, or WEBP images only.",
      }));
    } else if (
      selected.some((file) => file.size === 0 || file.size > MAX_FILE_SIZE)
    ) {
      setErrors((current) => ({
        ...current,
        photos:
          "Each photo must be nonempty and 5 MB or smaller. Choose a smaller image or reduce its resolution.",
      }));
    } else if (photos.length + selected.length > MAX_IMAGES) {
      setErrors((current) => ({
        ...current,
        photos: "You can upload up to 6 photos.",
      }));
    } else {
      setPhotos((current) => [...current, ...selected]);
      setFeedback(null);
      setErrors((current) => ({ ...current, photos: undefined }));
    }
    setFeedback(null);
    event.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotoAnnouncement(`${photos[index].name} removed.`);
    setPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index),
    );
    setFeedback(null);
    setErrors((current) => ({ ...current, photos: undefined }));
    document.getElementById("propertyPhotos")?.focus();
  }

  function makeCover(index: number) {
    setPhotoAnnouncement(`${photos[index].name} is now the cover photo.`);
    setPhotos((current) => [
      current[index],
      ...current.filter((_, itemIndex) => itemIndex !== index),
    ]);
    document.getElementById("propertyPhotos")?.focus();
  }

  function confirmLocation() {
    if (!draftLocation || !values.address.trim()) return;
    setSelectedLocation({ address: values.address.trim(), ...draftLocation });
    setErrors((current) => ({ ...current, location: undefined }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || isComplete) return;

    let payload: PropertyFormPayload | null = null;
    if (!createdPropertyId) {
      try {
        let validationErrors: FieldErrors = {};
        try {
          payload = buildPayload(values, selectedLocation);
        } catch (error) {
          if (error instanceof FormValidationError)
            validationErrors = error.fields;
          else throw error;
        }
        if (photos.length === 0)
          validationErrors.photos = "Add at least one property photo.";
        if (
          !propertyUniversitiesSchema.safeParse({
            university_ids: universities.map((u) => u.university_id),
          }).success
        )
          validationErrors.universities =
            "Choose valid universities without duplicates.";
        if (Object.keys(validationErrors).length)
          throw new FormValidationError(validationErrors);
      } catch (error) {
        if (error instanceof FormValidationError) {
          setErrors(error.fields);
          const firstField = (
            [
              "title",
              "propertyType",
              "description",
              "address",
              "location",
              "universities",
              "price",
              "bedrooms",
              "bathrooms",
              "bedCount",
              "furnished",
              "electricityIncluded",
              "kitchenType",
              "bathroomType",
              "gender",
              "photos",
            ] as const
          ).find((field) => error.fields[field])!;
          document
            .getElementById(
              firstField === "photos"
                ? "propertyPhotos"
                : firstField === "location"
                  ? draftLocation && values.address.trim()
                    ? "confirm-location"
                    : "address"
                  : firstField,
            )
            ?.focus();
        }
        setFeedback({
          message:
            error instanceof Error
              ? error.message
              : "Check the property details.",
        });
        return;
      }
    }

    submitting.current = true;
    setIsSubmitting(true);
    setFailedPhotoIndex(null);
    setSubmissionMessage("Checking your Host session…");
    setFeedback(null);
    let uploadingPhotoIndex: number | null = null;
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
        // An earlier attempt may have committed despite a lost response. An
        // auth/validation rejection on a retry cannot prove that it did not.
        const retryingCreation = requestId.current !== null;
        requestId.current ??= crypto.randomUUID();
        setCreationStarted(true);
        setSubmissionMessage("Saving property details…");
        const response = await fetch("/api/properties", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Idempotency-Key": requestId.current,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          if (!retryingCreation && [400, 401, 403].includes(response.status)) {
            setCreationStarted(false);
            requestId.current = null;
          }
          throw new Error(await readApiError(response));
        }

        const created: unknown = await response.json();
        if (
          !created ||
          typeof created !== "object" ||
          !("property_id" in created) ||
          typeof created.property_id !== "string" ||
          !z.uuid().safeParse(created.property_id).success
        ) {
          throw new Error(
            "The server response did not include a property ID. Retry this submission to safely confirm whether it was saved.",
          );
        }
        propertyId = created.property_id;
        setCreatedPropertyId(propertyId);
      }

      if (!propertyId) throw new Error("The property could not be created.");

      if (!universitiesSaved && universities.length) {
        setSubmissionMessage("Saving selected universities…");
        try {
          const response = await fetch(
            `/api/properties/${propertyId}/universities`,
            {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({
                university_ids: universities.map((u) => u.university_id),
              }),
            },
          );
          if (!response.ok) throw new Error(await readApiError(response));
          const acknowledgement = propertyUniversitiesSchema.safeParse(
            await response.json(),
          );
          if (
            !acknowledgement.success ||
            acknowledgement.data.university_ids.length !==
              universities.length ||
            universities.some(
              (u) =>
                !acknowledgement.data.university_ids.includes(u.university_id),
            )
          )
            throw new Error(
              "The server did not confirm all selected universities.",
            );
          setUniversitiesSaved(true);
          setErrors((current) => ({ ...current, universities: undefined }));
        } catch (error) {
          const message = `Property saved, but selected universities could not be confirmed: ${error instanceof Error ? error.message : "Check your connection."} Retry to finish this submission.`;
          setErrors((current) => ({ ...current, universities: message }));
          throw new Error(message);
        }
      }

      for (let index = uploadedPhotoCount; index < photos.length; index += 1) {
        uploadingPhotoIndex = index;
        setActivePhotoIndex(index);
        setSubmissionMessage(
          `Uploading photo ${index + 1} of ${photos.length}…`,
        );
        const formData = new FormData();
        formData.append("file", photos[index]);
        formData.append("sort_order", String(index));
        const photo = photos[index];
        if (!photoRequestIds.current.has(photo))
          photoRequestIds.current.set(photo, crypto.randomUUID());
        const response = await fetch(`/api/properties/${propertyId}/media`, {
          method: "POST",
          headers: {
            ...headers,
            "Idempotency-Key": photoRequestIds.current.get(photo)!,
          },
          body: formData,
        }).catch(() => {
          throw new Error(
            `Property saved, but photo ${index + 1} could not be uploaded. Check your connection and retry the remaining photos.`,
          );
        });
        if (!response.ok) {
          throw new Error(
            `Property saved, but photo ${index + 1} failed: ${await readApiError(response)} Retry to upload the remaining photos.`,
          );
        }
        setUploadedPhotoCount(index + 1);
      }

      uploadingPhotoIndex = null;
      setIsComplete(true);
      setSubmissionMessage("All photos uploaded. Opening confirmation…");
      router.replace("/properties/create/confirmation");
    } catch (error) {
      if (uploadingPhotoIndex !== null)
        setFailedPhotoIndex(uploadingPhotoIndex);
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Could not create the listing. Please try again.",
      });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
      setActivePhotoIndex(null);
    }
  }

  const fieldProps = { onChange: updateField, disabled: fieldsLocked, errors };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
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
            hint="Share the features and nearby places students should know about."
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
            hint="Include the street, building and city. You can edit this after selecting a map pin."
            fullWidth
          />
        </div>
        <PropertyLocationPicker
          address={values.address}
          position={draftLocation}
          confirmed={Boolean(selectedLocation)}
          disabled={fieldsLocked}
          searchEnabled={searchEnabled}
          error={errors.location}
          onSelect={(point) => {
            setDraftLocation(point);
            setSelectedLocation(null);
            setFeedback(null);
          }}
          onConfirm={confirmLocation}
          onAddress={(address) => updateField("address", address)}
          onUnconfirm={() => setSelectedLocation(null)}
        />
        <PropertyUniversitySelect
          selected={universities}
          disabled={fieldsLocked}
          error={errors.universities}
          onChange={(selected) => {
            setUniversities(selected);
            setErrors((current) => ({ ...current, universities: undefined }));
            setFeedback(null);
          }}
        />
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
            hint="Enter the monthly rent in US dollars."
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
            placeholder="Select furnished status"
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
            placeholder="Select electricity option"
            hint="Is electricity included in the monthly rent?"
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
            placeholder="Select residents"
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
        description="Add at least one photo. Choose the cover students will see first."
      >
        <div className="mt-[28px] w-full">
          <input
            id="propertyPhotos"
            className="peer sr-only"
            aria-label="Property photos"
            aria-required="true"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            aria-invalid={Boolean(errors.photos)}
            aria-describedby={`photos-help${errors.photos ? " photos-error" : ""}`}
            disabled={fieldsLocked}
            onChange={handlePhotoChange}
          />

          <label
            htmlFor="propertyPhotos"
            className={`
              group m-0! flex! min-h-[180px] w-full cursor-pointer
              flex-col items-center justify-center gap-[8px]
              rounded-(--radius-sm) border border-dashed
              border-(--line-strong) bg-(--bg)
              px-[24px] py-[28px] text-center
              transition-colors motion-reduce:transition-none
              duration-[200ms] ease-[ease]
              hover:border-(--ink) hover:bg-(--chip)
              peer-focus-visible:outline-2 peer-focus-visible:outline-solid
              peer-focus-visible:outline-(--ink)
              peer-focus-visible:outline-offset-[3px]
              [@media(width<=480px)]:px-[18px]
              [@media(width<=480px)]:py-[28px]
              ${fieldsLocked ? "cursor-not-allowed! opacity-60" : ""}
            `}
          >
            <span
              aria-hidden="true"
              className="mb-1 grid size-[44px] place-items-center rounded-(--radius-full) bg-(--chip) text-(--ink)"
            >
              <ImagePlus size={21} />
            </span>

            <span className="block text-[16px] font-semibold tracking-[-0.01em] text-(--ink)">
              {fieldsLocked
                ? "Photo selection locked"
                : photos.length > 0
                  ? "Add more photos"
                  : "Add property photos"}
            </span>

            <span className="block text-[13px] leading-[1.5] text-(--soft)">
              JPG, PNG or WEBP · up to 5 MB each
            </span>

            <span
              className="
                mt-[10px] inline-flex items-center justify-center
                rounded-[999px] border border-[rgba(22,23,26,0.12)]
                min-h-[44px] bg-(--surface) px-[18px] py-[10px]
                text-[13px] font-medium text-(--ink)
                transition-[border-color,background] duration-[200ms] ease-[ease]
                group-hover:border-(--ink)
              "
            >
              {fieldsLocked ? "Finish the uploads below" : "Choose photos"}
            </span>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] leading-5 text-(--soft)">
          <p id="photos-help">Add 1–6 photos. The cover photo appears first.</p>
          <p role="status" aria-live="polite" aria-atomic="true">
            {photos.length} of {MAX_IMAGES} photos selected
          </p>
        </div>

        {photos.length > 0 && (
          <div
            className="
              mt-[18px] grid grid-cols-3 gap-[14px]
              [@media(480px<width<=900px)]:grid-cols-2
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
                status={
                  index < uploadedPhotoCount
                    ? "uploaded"
                    : index === activePhotoIndex
                      ? "uploading"
                      : index === failedPhotoIndex
                        ? "failed"
                        : "ready"
                }
                onCover={() => makeCover(index)}
              />
            ))}
          </div>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {photoAnnouncement}
        </p>
        {errors.photos && (
          <p
            id="photos-error"
            role="alert"
            className="mt-3 text-[13px] text-(--danger)"
          >
            {errors.photos}
          </p>
        )}
        {createdPropertyId && !isSubmitting && !isComplete && (
          <p role="status" className="mt-3 text-[13px] text-(--soft)">
            Property details are saved. {uploadedPhotoCount} of {photos.length}{" "}
            photos uploaded. Keep this page open and retry to finish your
            submission.
          </p>
        )}
      </FormSection>

      {feedback && (
        <div
          role="alert"
          className="
            mx-[40px] mt-[24px] mb-[24px] flex items-start gap-[12px]
            rounded-[14px] border px-[18px] py-[16px]
            text-[13px] leading-[1.5]
            [@media(480px<width<=700px)]:mx-[24px]
            [@media(480px<width<=700px)]:mt-[20px]
            [@media(width<=480px)]:mx-[20px]
            [@media(width<=480px)]:mt-[18px]
            border-[rgba(138,59,50,0.12)] bg-(--danger-bg) text-(--danger)
          "
        >
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center font-semibold"
          >
            !
          </span>
          <div className="space-y-2">
            <p className="m-0">{feedback.message}</p>
            {creationStarted && !createdPropertyId && (
              <p>
                Retry this submission to safely check whether the property was
                saved. Keep this page open.
              </p>
            )}
          </div>
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
          <p className="text-[15px] font-medium text-(--ink)">
            Ready to submit for review?
          </p>
          <p className="text-[13px] leading-[1.5] text-(--soft)">
            Your listing needs Admin approval and an active, paid boost before
            it is published.
          </p>
          {(isSubmitting || isComplete) && (
            <div className="mt-4 space-y-2">
              <p
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-[13px] font-medium text-(--ink)"
              >
                {submissionMessage}
              </p>
              {createdPropertyId && (
                <progress
                  aria-label="Photo upload progress"
                  className="block h-1.5 w-full max-w-[320px] accent-(--ink)"
                  max={photos.length}
                  value={uploadedPhotoCount}
                />
              )}
              <p className="text-[12px] text-(--soft)">
                Keep this page open until all photos are uploaded.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isComplete}
          className="
            inline-flex min-h-[52px] min-w-[190px] shrink-0 cursor-pointer
            items-center justify-center gap-[12px]
            rounded-(--radius-full) [border:0]
            bg-(--ink) px-[22px] py-[14px]
            text-[14px]! font-medium! whitespace-nowrap text-white
            transition-colors
            duration-(--duration-fast) ease-[ease]
            hover:bg-(--btn-bg-hover)
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
              ? activePhotoIndex !== null
                ? "Uploading photos…"
                : createdPropertyId && universities.length && !universitiesSaved
                  ? "Saving universities…"
                  : "Saving property…"
              : createdPropertyId
                ? universities.length && !universitiesSaved
                  ? "Retry submission"
                  : "Retry photo uploads"
                : creationStarted
                  ? "Retry submission"
                  : "Submit for review"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
