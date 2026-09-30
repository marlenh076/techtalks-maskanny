type FeaturedListing = {
  id: number;
  name: string;
  location: string;
  university: string;
  price: number;
  roomType: string;
  gender: string;
  furnished: string;
};

const featuredListings: FeaturedListing[] = [
  {
    id: 2,
    name: "Bliss Student Studios",
    location: "Hamra, Beirut",
    university: "American University of Beirut",
    price: 300,
    roomType: "Studio",
    gender: "Mixed",
    furnished: "Yes",
  },
  {
    id: 3,
    name: "Verdun Student Residence",
    location: "Verdun, Beirut",
    university: "Lebanese American University",
    price: 220,
    roomType: "Shared",
    gender: "Female",
    furnished: "Yes",
  },
  {
    id: 4,
    name: "Beirut Student Living",
    location: "Ras Beirut, Beirut",
    university: "Lebanese American University",
    price: 275,
    roomType: "Single",
    gender: "Mixed",
    furnished: "Yes",
  },
];

function FeaturedListingCard({ listing }: { listing: FeaturedListing }) {
  return (
    <a
      href={`/properties/${listing.id}`}
      className="
        min-w-0 overflow-hidden rounded-[24px]
        border border-(--line) bg-(--surface)
        text-inherit no-underline
        transition-[transform,box-shadow] duration-[220ms] ease-[ease]
        hover:[transform:translateY(-4px)]
        hover:shadow-[0_20px_50px_-34px_rgba(22,23,26,0.35)]
        [@media(650px<width<=950px)]:last:hidden
      "
    >
      <div
        className="
          relative h-[270px] overflow-hidden bg-(--placeholder-bg)
          [@media(width<=650px)]:h-[250px]
        "
      >
        <div
          className="
            flex h-full w-full flex-col items-center justify-center gap-[10px]
            bg-[linear-gradient(145deg,#e9e6df,#dedbd3)]
            text-[12px] text-(--soft)
          "
        >
          <span
            aria-hidden="true"
            className="
              grid size-[42px] place-items-center rounded-[50%]
              border border-[rgba(22,23,26,0.1)] bg-white/65
              text-[17px] text-(--ink)
            "
          >
            ◇
          </span>
          <span>Property photo</span>
        </div>

        <span
          className="
            absolute top-[16px] right-[16px]
            rounded-[999px] bg-white/92 px-[13px] py-[8px]
            text-[11px] font-semibold text-(--ink) backdrop-blur-[8px]
          "
        >
          {listing.roomType}
        </span>
      </div>

      <div className="p-[20px]">
        <div className="flex items-start justify-between gap-[18px]">
          <div className="min-w-0">
            <h3
              className="
                m-0 text-[17px] leading-[1.3]
                font-medium tracking-[-0.02em] text-(--ink)
              "
            >
              {listing.name}
            </h3>

            <p
              className="
                mt-[8px] mb-0 flex items-center gap-[5px]
                text-[12px] text-(--soft)
              "
            >
              <span aria-hidden="true">⌖</span>
              {listing.location}
            </p>
          </div>

          <div className="flex flex-none items-baseline gap-[3px] whitespace-nowrap">
            <strong className="text-[17px] font-semibold text-(--ink)">
              ${listing.price}
            </strong>
            <span className="text-[10px] text-(--soft)">/ mo</span>
          </div>
        </div>

        <div className="mt-[18px] mb-[14px] h-px bg-(--line)" />

        <div className="flex items-center gap-[8px] text-[12px] text-(--ink-2)">
          <span>{listing.gender}</span>
          <span className="text-(--faint)">•</span>
          <span>
            {listing.furnished === "Yes" ? "Furnished" : "Unfurnished"}
          </span>
        </div>

        <p className="mt-[10px] mb-0 text-[11px] leading-[1.45] text-(--soft)">
          Near {listing.university}
        </p>
      </div>
    </a>
  );
}

export default function FeaturedListings() {
  return (
    <section
      aria-labelledby="featured-listings-title"
      className="
        mx-auto mt-[110px] w-full max-w-[1180px]
        border-t border-(--line) pt-[72px]
        [@media(width<=650px)]:mt-[72px]
        [@media(width<=650px)]:pt-[52px]
      "
    >
      <div
        className="
          mb-[36px] flex items-end justify-between gap-[32px]
          [@media(width<=650px)]:flex-col
          [@media(width<=650px)]:items-start
        "
      >
        <div>
          <span
            className="
              mb-[12px] block text-[11px] font-semibold
              tracking-[0.13em] text-(--soft) uppercase
            "
          >
            Keep exploring
          </span>

          <h2
            id="featured-listings-title"
            className="
              m-0 text-[clamp(38px,5vw,58px)] leading-none
              font-medium tracking-[-0.045em] text-(--ink)
            "
          >
            Featured listings
          </h2>

          <p className="mt-[16px] mb-0 max-w-[520px] text-[14px] leading-[1.6] text-(--soft)">
            Discover more student housing options that might suit what
            you&apos;re looking for.
          </p>
        </div>
      </div>

      <div
        className="
          grid grid-cols-3 gap-[18px]
          [@media(650px<width<=950px)]:grid-cols-2
          [@media(width<=650px)]:grid-cols-1
        "
      >
        {featuredListings.map((listing) => (
          <FeaturedListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}