"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

type FormValues = {
  propertyType: string;
  name: string;
  description: string;
  price: string;
  location: string;
  university: string;
  roomType: string;
  gender: string;
  furnished: string;
  rules: string;
  availability: string;
  otherAmenities: string;
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
  name: "",
  description: "",
  price: "",
  location: "",
  university: "",
  roomType: "",
  gender: "",
  furnished: "",
  rules: "",
  availability: "",
  otherAmenities: "",
};

const AMENITY_OPTIONS: Option[] = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "electricity", label: "Electricity" },
  { value: "generator", label: "Generator" },
  { value: "private-kitchen", label: "Private Kitchen" },
  { value: "shared-kitchen", label: "Shared Kitchen" },
  { value: "private-bathroom", label: "Private Bathroom" },
  { value: "shared-bathroom", label: "Shared Bathroom" },
  { value: "washing-machine", label: "Washing Machine" },
  { value: "parking", label: "Parking" },
  { value: "air-conditioning", label: "Air Conditioning" },
  { value: "heating", label: "Heating" },
  { value: "elevator", label: "Elevator" },
  { value: "balcony", label: "Balcony" },
];

const ACCOMMODATION_FIELDS: {
  id: keyof FormValues;
  label: string;
  placeholder: string;
  options: Option[];
}[] = [
  {
    id: "propertyType",
    label: "Property type",
    placeholder: "Select property type",
    options: [
      { value: "dorm", label: "Dorm" },
      { value: "apartment", label: "Apartment" },
      { value: "studio", label: "Studio" },
      { value: "room", label: "Room" },
    ],
  },
  {
    id: "roomType",
    label: "Room type",
    placeholder: "Select room type",
    options: [
      { value: "single", label: "Single" },
      { value: "shared", label: "Shared" },
    ],
  },
  {
    id: "gender",
    label: "Gender",
    placeholder: "Select gender",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "mixed", label: "Mixed" },
    ],
  },
  {
    id: "furnished",
    label: "Furnished",
    placeholder: "Select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

const REQUIRED_FIELDS: {
  field: keyof FormValues;
  message: string;
}[] = [
  { field: "propertyType", message: "Please select a property type." },
  { field: "name", message: "Property name is required." },
  { field: "description", message: "Description is required." },
  { field: "price", message: "Price must be greater than 0." },
  { field: "location", message: "Location is required." },
  { field: "university", message: "Nearby university is required." },
  { field: "roomType", message: "Please select a room type." },
  { field: "gender", message: "Please select a gender." },
  {
    field: "furnished",
    message: "Please select whether the property is furnished.",
  },
  { field: "availability", message: "Please select availability." },
];

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

function validateForm(values: FormValues): string | null {
  for (const { field, message } of REQUIRED_FIELDS) {
    const value = values[field].trim();

    if (!value) return message;

    if (
      field === "price" &&
      (!Number.isFinite(Number(value)) || Number(value) <= 0)
    ) {
      return message;
    }
  }

  return null;
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
          <p>{description}</p>
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
  hint,
}: FormFieldProps) {
  const fieldProps = {
    id,
    value,
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
          min={type === "number" ? "0" : undefined}
          placeholder={placeholder}
          className={INPUT_CLASSES}
        />
      )}

      {hint && <p>{hint}</p>}
    </div>
  );
}
/* eslint-disable @next/next/no-img-element -- Local file preview uses a browser blob URL. */
function PhotoPreview({
  photo,
  index,
  onRemove,
}: {
  photo: File;
  index: number;
  onRemove: () => void;
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
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function updateField(id: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  function toggleAmenity(value: string) {
    setAmenities((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);

    setPhotos((current) => [...current, ...selected]);
    event.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateForm(values);

    if (error) {
      setFeedback({ type: "error", message: error });
      return;
    }

    // Add the backend request here when the API is ready.
    setFeedback({
      type: "success",
      message: "Listing is ready to be submitted.",
    });
  }

  const fieldProps = { onChange: updateField };

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
            id="name"
            label="Property name"
            value={values.name}
            placeholder="e.g. Hamra Student Residence"
          />
          <FormField
            {...fieldProps}
            id="price"
            label="Monthly price ($)"
            value={values.price}
            type="number"
            placeholder="e.g. 250"
          />
          <FormField
            {...fieldProps}
            id="description"
            label="Description"
            value={values.description}
            placeholder="Describe the property, room and what makes it a good fit for students..."
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
            id="location"
            label="Location"
            value={values.location}
            placeholder="e.g. Hamra, Beirut"
          />
          <FormField
            {...fieldProps}
            id="university"
            label="Nearby university"
            value={values.university}
            placeholder="e.g. Lebanese American University"
          />
        </div>
      </FormSection>

      <FormSection
        number="03"
        title="Accommodation details"
        description="Add the details students commonly use when comparing listings."
      >
        <div className={GRID_CLASSES}>
          {ACCOMMODATION_FIELDS.map((field) => (
            <FormField
              key={field.id}
              {...fieldProps}
              {...field}
              value={values[field.id]}
            />
          ))}
        </div>
      </FormSection>

      <FormSection
        number="04"
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
            onChange={handlePhotoChange}
          />

          <label
            htmlFor="propertyPhotos"
            className="
              group m-0! flex! min-h-[220px] w-full cursor-pointer
              flex-col items-center justify-center gap-[8px]
              rounded-[24px] border border-dashed
              border-[rgba(22,23,26,0.2)] bg-(--bg)
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
                />
              ))}
            </div>

            <p className="mx-[2px] mt-[12px] mb-0 text-[12px] text-(--soft)">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}{" "}
              selected
            </p>
          </>
        )}
      </FormSection>

      <FormSection
        number="05"
        title="Amenities"
        description="Select everything that is available at this property."
      >
        <fieldset>
          <legend className="sr-only">Available amenities</legend>

          <div
            className="
              grid grid-cols-4 gap-[12px]
              [@media(480px<width<=900px)]:grid-cols-2
              [@media(width<=480px)]:grid-cols-1
            "
          >
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = amenities.includes(amenity.value);

              return (
                <label
                  key={amenity.value}
                  className={`
                    relative flex! min-h-[62px] cursor-pointer items-center
                    rounded-(--radius-sm) border px-[20px] py-0
                    transition-[background,color,border-color,transform]
                    duration-(--duration-fast) ease-[ease]
                    hover:[transform:translateY(-1px)]
                    focus-within:outline-2 focus-within:outline-solid
                    focus-within:outline-(--ink) focus-within:outline-offset-[3px]
                    motion-reduce:transition-none motion-reduce:transform-none
                    ${
                      selected
                        ? "border-(--ink) bg-(--ink) text-white!"
                        : "border-transparent bg-(--bg) text-(--ink-2)! hover:border-(--line-strong) hover:bg-(--chip)"
                    }
                  `}
                >
                  <input
                    className="sr-only pointer-events-none opacity-0"
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleAmenity(amenity.value)}
                  />

                  <span aria-hidden="true">{selected ? "✓" : "+"}</span>
                  <span>{amenity.label}</span>
                </label>
              );
            })}
          </div>

          <FormField
            {...fieldProps}
            id="otherAmenities"
            label="Other amenities"
            value={values.otherAmenities}
            placeholder="e.g. Rooftop access, gym, study room"
            hint="Add any additional amenities not listed above."
            fullWidth
          />
        </fieldset>
      </FormSection>

      <FormSection
        number="06"
        title="Availability & rules"
        description="Finish with availability and any rules students should know."
      >
        <div className={GRID_CLASSES}>
          <FormField
            {...fieldProps}
            id="availability"
            label="Availability"
            value={values.availability}
            placeholder="Select availability"
            options={[
              { value: "available", label: "Available" },
              { value: "unavailable", label: "Unavailable" },
            ]}
          />

          <FormField
            {...fieldProps}
            id="rules"
            label="House rules"
            value={values.rules}
            placeholder="e.g. No smoking, quiet hours after 11 PM..."
            multiline
            fullWidth
          />
        </div>
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
          border-t border-(--line) bg-[#faf9f6] px-[40px] py-[30px]
          [@media(width<=700px)]:flex-col
          [@media(width<=700px)]:items-stretch
          [@media(480px<width<=700px)]:px-[24px]
          [@media(480px<width<=700px)]:py-[26px]
          [@media(width<=480px)]:px-[20px]
          [@media(width<=480px)]:py-[24px]
        "
      >
        <div>
          <p>Ready to publish?</p>
          <p className="text-[13px] leading-[1.5] text-(--soft)">
            You can review and update your listing later.
          </p>
        </div>

        <button
          type="submit"
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
          "
        >
          Create listing
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}