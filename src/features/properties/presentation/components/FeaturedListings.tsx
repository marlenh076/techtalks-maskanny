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

export default function FeaturedListings() {
  return (
    <section
      className="featured-listings"
      aria-labelledby="featured-listings-title"
    >
      <div className="featured-listings-header">
        <div>
          <span className="featured-listings-eyebrow">
            Keep exploring
          </span>

          <h2 id="featured-listings-title">
            Featured listings
          </h2>

          <p>
            Discover more student housing options that might
            suit what you&apos;re looking for.
          </p>
        </div>

        
      </div>

      <div className="featured-listings-grid">
        {featuredListings.map((listing) => (
          <a
            href={`/properties/${listing.id}`}
            className="featured-listing-card"
            key={listing.id}
          >
            <div className="featured-listing-image">
              <div className="featured-listing-placeholder">
                <span aria-hidden="true">◇</span>
                <span>Property photo</span>
              </div>

              <span className="featured-listing-room-type">
                {listing.roomType}
              </span>
            </div>

            <div className="featured-listing-content">
              <div className="featured-listing-top">
                <div>
                  <h3>{listing.name}</h3>

                  <p className="featured-listing-location">
                    <span aria-hidden="true">⌖</span>
                    {listing.location}
                  </p>
                </div>

                <div className="featured-listing-price">
                  <strong>${listing.price}</strong>
                  <span>/ mo</span>
                </div>
              </div>

              <div className="featured-listing-divider" />

              <div className="featured-listing-meta">
                <span>{listing.gender}</span>

                <span className="featured-listing-meta-dot">
                  •
                </span>

                <span>
                  {listing.furnished === "Yes"
                    ? "Furnished"
                    : "Unfurnished"}
                </span>
              </div>

              <p className="featured-listing-university">
                Near {listing.university}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}