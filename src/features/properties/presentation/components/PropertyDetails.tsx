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

  return (
    <article className="property-details">
      {/* Header */}
      <header className="property-details-header">
        <div className="property-details-heading">
          <div className="property-details-location">
            <span aria-hidden="true">⌖</span>
            <span>{location}</span>
          </div>

          <h1>{name}</h1>

          <p className="property-details-university">
            Near {university}
          </p>
        </div>

        <div className="property-details-price">
          <span className="property-price-value">${price}</span>
          <span className="property-price-period">/ month</span>
        </div>
      </header>

      {/* Property gallery placeholder */}
      <section
        className="property-gallery"
        aria-label="Property photos"
      >
        <div className="property-gallery-main">
          <div className="property-gallery-placeholder">
            <span className="property-gallery-icon" aria-hidden="true">
              ◇
            </span>
            <span>Property photos will appear here</span>
          </div>

          <span
            className={`property-availability-badge ${
              isAvailable
                ? "property-availability-badge--available"
                : "property-availability-badge--unavailable"
            }`}
          >
            <span className="property-status-dot" />
            {availability}
          </span>
        </div>

        <div className="property-gallery-side">
          <div className="property-gallery-placeholder">
            <span>Photo</span>
          </div>

          <div className="property-gallery-placeholder">
            <span>Photo</span>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section
        className="property-quick-facts"
        aria-label="Property highlights"
      >
        <div className="property-fact">
          <span className="property-fact-label">Room type</span>
          <strong>{roomType}</strong>
        </div>

        <div className="property-fact">
          <span className="property-fact-label">Gender</span>
          <strong>{gender}</strong>
        </div>

        <div className="property-fact">
          <span className="property-fact-label">Furnished</span>
          <strong>{furnished}</strong>
        </div>

        <div className="property-fact">
          <span className="property-fact-label">Availability</span>
          <strong>{availability}</strong>
        </div>
      </section>

      {/* Main content */}
      <div className="property-details-layout">
        <div className="property-details-main">
          {/* About */}
          <section className="property-content-section">
            <span className="property-section-eyebrow">
              About
            </span>

            <h2>About this property</h2>

            <p className="property-description">
              {description}
            </p>
          </section>

          {/* Amenities */}
          <section className="property-content-section">
            <span className="property-section-eyebrow">
              What&apos;s included
            </span>

            <h2>Amenities</h2>

            {amenities.length > 0 ? (
              <div className="property-amenities">
                {amenities.map((amenity) => (
                  <div
                    className="property-amenity"
                    key={amenity}
                  >
                    <span
                      className="property-amenity-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="property-empty-text">
                No amenities have been added yet.
              </p>
            )}
          </section>

          {/* Rules */}
          <section className="property-content-section">
            <span className="property-section-eyebrow">
              Before you move in
            </span>

            <h2>House rules</h2>

            <div className="property-rules">
              <span
                className="property-rules-icon"
                aria-hidden="true"
              >
                i
              </span>

              <p>
                {rules.trim()
                  ? rules
                  : "No specific house rules have been provided."}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="property-sidebar">
          <div className="property-contact-card">
            <span className="property-contact-eyebrow">
              Interested in this place?
            </span>

            <div className="property-contact-price">
              <strong>${price}</strong>
              <span>/ month</span>
            </div>

            <div className="property-contact-divider" />

            <div className="property-contact-detail">
              <span>Location</span>
              <strong>{location}</strong>
            </div>

            <div className="property-contact-detail">
              <span>University</span>
              <strong>{university}</strong>
            </div>

            <div className="property-contact-detail">
              <span>Status</span>
              <strong>{availability}</strong>
            </div>

            <button
              type="button"
              className="btn btn-block property-contact-button"
            >
              Contact owner
              <span aria-hidden="true">→</span>
            </button>

            <p className="property-contact-note">
              Contact the property owner to ask questions or
              arrange a viewing.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}