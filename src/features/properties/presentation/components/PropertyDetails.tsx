import type { ReactNode } from "react";

type PropertyDetailsProps = {
  name: string;
  description: string;
  price: number;
  location: string;
  university: string;
  roomType: string;
  gender: string;
  furnished: string;
  rules: string;
  availability: string;
  amenities: string[];
};

type PropertySectionProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

function PropertySection({ eyebrow, title, children }: PropertySectionProps) {
  return (
    <section className="mb-[56px] border-b border-(--line) pb-[56px] last:mb-0 last:border-b-0">
      <span className="mb-[14px] block text-[11px] font-semibold tracking-[0.13em] text-(--soft) uppercase">
        {eyebrow}
      </span>

      <h2
        className="
          mt-0 mb-[22px] text-[30px] font-medium
          tracking-[-0.03em] text-(--ink)
          [@media(width<=520px)]:text-[26px]
        "
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

export default function PropertyDetails({
  name,
  description,
  price,
  location,
  university,
  roomType,
  gender,
  furnished,
  rules,
  availability,
  amenities,
}: PropertyDetailsProps) {
  const isAvailable = availability.toLowerCase() === "available";

  const quickFacts = [
    { label: "Room type", value: roomType },
    { label: "Gender", value: gender },
    { label: "Furnished", value: furnished },
    { label: "Availability", value: availability },
  ];

  const contactDetails = [
    { label: "Location", value: location },
    { label: "University", value: university },
    { label: "Status", value: availability },
  ];

  return (
    <article className="mx-auto my-0 w-full max-w-[1180px] text-(--ink)">
      {/* Header */}
      <header
        className="
          mb-[38px] flex items-end justify-between gap-[40px]
          [@media(width<=760px)]:flex-col
          [@media(width<=760px)]:items-start
          [@media(width<=760px)]:gap-[24px]
        "
      >
        <div className="min-w-0">
          <div className="mb-[18px] flex items-center gap-[7px] text-[13px] text-(--soft)">
            <span
              aria-hidden="true"
              className="
                grid size-[24px] place-items-center
                rounded-(--radius-full) bg-(--chip)
                text-[14px] text-(--ink)
              "
            >
              ⌖
            </span>
            <span>{location}</span>
          </div>

          <h1
            className="
              m-0 max-w-[780px] text-[clamp(40px,5vw,64px)]
              leading-[0.98] font-medium tracking-[-0.045em] text-(--ink)
              [@media(width<=520px)]:text-[40px]
            "
          >
            {name}
          </h1>

          <p className="mt-[18px] mb-0 text-[15px] leading-[1.5] text-(--soft)">
            Near {university}
          </p>
        </div>

        <div className="flex flex-none items-baseline gap-[6px] pb-[5px]">
          <span className="text-[34px] font-medium tracking-[-0.035em] text-(--ink)">
            ${price}
          </span>
          <span className="text-[14px] text-(--soft)">/ month</span>
        </div>
      </header>

      {/* Gallery */}
      <section
        aria-label="Property photos"
        className="
          grid h-[530px]
          grid-cols-[minmax(0,2fr)_minmax(240px,0.8fr)]
          gap-[10px] overflow-hidden
          rounded-(--radius-xl) bg-(--placeholder-bg)
          [@media(760px<width<=1000px)]:h-[450px]
          [@media(width<=760px)]:h-auto
          [@media(width<=760px)]:grid-cols-1
        "
      >
        <div
          className="
            relative min-h-0 min-w-0
            [@media(520px<width<=760px)]:min-h-[380px]
            [@media(width<=520px)]:min-h-[300px]
          "
        >
          <div
            className="
              flex h-full w-full flex-col items-center justify-center
              gap-[12px] bg-[linear-gradient(145deg,#e9e6df,#dedbd3)]
              text-[13px] text-(--soft)
            "
          >
            <span
              aria-hidden="true"
              className="
                grid size-[52px] place-items-center
                rounded-(--radius-full)
                border border-[rgba(22,23,26,0.12)]
                bg-white/55 text-[20px] text-(--ink)
              "
            >
              ◇
            </span>
            <span>Property photos will appear here</span>
          </div>

          <span
            className="
              absolute top-[20px] left-[20px]
              inline-flex items-center gap-[8px]
              rounded-(--radius-full) bg-white/92 px-[13px] py-[8px]
              text-[12px] font-medium text-(--ink) backdrop-blur-[8px]
            "
          >
            <span
              className={`size-[7px] rounded-(--radius-full) ${
                isAvailable ? "bg-[#54705a]" : "bg-(--danger)"
              }`}
            />
            {availability}
          </span>
        </div>

        <div
          className="
            grid min-h-0 min-w-0 grid-rows-[1fr_1fr] gap-[10px]
            [@media(width<=760px)]:h-[180px]
            [@media(width<=760px)]:grid-cols-[1fr_1fr]
            [@media(width<=760px)]:grid-rows-none
            [@media(width<=520px)]:hidden
          "
        >
          {[0, 1].map((index) => (
            <div
              key={index}
              className="
                flex h-full w-full flex-col items-center justify-center
                gap-[12px] bg-[linear-gradient(145deg,#e9e6df,#dedbd3)]
                text-[12px] text-(--soft)
              "
            >
              <span>Photo</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick facts */}
      <section
        aria-label="Property highlights"
        className="
          mt-[18px] grid grid-cols-4 overflow-hidden
          rounded-(--radius-md) border border-(--line) bg-(--surface)
          [@media(520px<width<=760px)]:grid-cols-[repeat(2,1fr)]
          [@media(width<=520px)]:grid-cols-1
        "
      >
        {quickFacts.map(({ label, value }) => (
          <div
            key={label}
            className="
              border-r border-(--line) px-[24px] py-[22px]
              last:border-r-0
              [@media(520px<width<=760px)]:nth-2:border-r-0
              [@media(520px<width<=760px)]:[&:nth-child(-n+2)]:border-b
              [@media(width<=520px)]:border-r-0
              [@media(width<=520px)]:border-b
              [@media(width<=520px)]:last:border-b-0
            "
          >
            <span className="mb-[7px] block text-[12px] text-(--soft)">
              {label}
            </span>
            <strong className="text-[14px] font-medium text-(--ink) capitalize">
              {value}
            </strong>
          </div>
        ))}
      </section>

      {/* Content and sidebar */}
      <div
        className="
          mt-[76px] grid grid-cols-[minmax(0,1fr)_350px]
          items-start gap-[72px]
          [@media(width<=1000px)]:grid-cols-1
          [@media(width<=1000px)]:gap-[48px]
          [@media(width<=760px)]:mt-[52px]
        "
      >
        <div className="min-w-0">
          <PropertySection eyebrow="About" title="About this property">
            <p className="m-0 max-w-[680px] text-[16px] leading-[1.75] text-(--ink-2)">
              {description}
            </p>
          </PropertySection>

          <PropertySection eyebrow="What's included" title="Amenities">
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-[12px] [@media(width<=520px)]:grid-cols-1">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="
                      flex min-h-[58px] items-center gap-[12px]
                      rounded-(--radius-sm) bg-(--surface)
                      px-[16px] py-[14px] text-[14px] text-(--ink-2)
                      shadow-[0_0_0_1px_var(--line)]
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="
                        grid size-[28px] flex-none place-items-center
                        rounded-(--radius-full) bg-(--chip)
                        text-[11px] font-semibold text-(--ink)
                      "
                    >
                      ✓
                    </span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m-0 text-[14px] text-(--soft)">
                No amenities have been added yet.
              </p>
            )}
          </PropertySection>

          <PropertySection eyebrow="Before you move in" title="House rules">
            <div
              className="
                flex items-start gap-[14px]
                rounded-(--radius-sm) bg-(--surface) p-[20px]
                shadow-[0_0_0_1px_var(--line)]
              "
            >
              <span
                aria-hidden="true"
                className="
                  grid size-[28px] flex-none place-items-center
                  rounded-(--radius-full) bg-(--ink)
                  text-[12px] font-semibold text-white
                "
              >
                i
              </span>
              <p className="mt-[3px] mb-0 text-[14px] leading-[1.65] text-(--ink-2)">
                {rules.trim()
                  ? rules
                  : "No specific house rules have been provided."}
              </p>
            </div>
          </PropertySection>
        </div>

        <aside className="relative [@media(width<=1000px)]:order-first">
          <div
            className="
              sticky top-[32px] rounded-(--radius-lg)
              bg-(--surface) p-[28px]
              shadow-[0_0_0_1px_var(--line),0_20px_60px_-42px_rgba(22,23,26,0.35)]
              [@media(width<=1000px)]:static
              [@media(width<=520px)]:p-[24px]
            "
          >
            <span className="mb-[18px] block text-[13px] text-(--soft)">
              Interested in this place?
            </span>

            <div className="flex items-baseline gap-[6px]">
              <strong className="text-[32px] font-medium tracking-[-0.035em] text-(--ink)">
                ${price}
              </strong>
              <span className="text-[13px] text-(--soft)">/ month</span>
            </div>

            <div className="my-[24px] h-px bg-(--line)" />

            {contactDetails.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between gap-[20px] py-[10px] text-[13px]"
              >
                <span className="text-(--soft)">{label}</span>
                <strong className="max-w-[180px] text-right font-medium text-(--ink)">
                  {value}
                </strong>
              </div>
            ))}

            <button
              type="button"
              className="
                mt-[24px] inline-flex min-h-[50px] w-full cursor-pointer
                items-center justify-center gap-[8px]
                rounded-(--radius-full) [border:0]
                bg-(--btn-bg) p-[16px]
                text-[14px]! font-medium! whitespace-nowrap text-(--btn-ink)
                transition-[background,transform,border-color]
                duration-(--duration-fast) ease-[ease]
                hover:bg-(--btn-bg-hover)
                active:[transform:scale(0.98)]
                focus-visible:outline-2 focus-visible:outline-solid
                focus-visible:outline-(--ink) focus-visible:outline-offset-[3px]
              "
            >
              Contact owner
              <span aria-hidden="true">→</span>
            </button>

            <p className="mx-[8px] mt-[14px] mb-0 text-center text-[11px] leading-[1.55] text-(--soft)">
              Contact the property owner to ask questions or arrange a viewing.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}