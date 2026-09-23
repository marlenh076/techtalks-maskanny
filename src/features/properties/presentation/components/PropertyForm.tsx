"use client";

import { useState } from "react";

export default function PropertyForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [university, setUniversity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [gender, setGender] = useState("");
  const [furnished, setFurnished] = useState("");
  const [rules, setRules] = useState("");
  const [availability, setAvailability] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAmenityChange(amenity: string) {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const selectedPhotos = Array.from(e.target.files);

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      ...selectedPhotos,
    ]);

    // Allows the same image to be selected again after removal.
    e.target.value = "";
  }

  function removePhoto(indexToRemove: number) {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((_, index) => index !== indexToRemove)
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (name.trim() === "") {
      setError("Property name is required.");
      return;
    }

    if (description.trim() === "") {
      setError("Description is required.");
      return;
    }

    if (price === "" || Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (location.trim() === "") {
      setError("Location is required.");
      return;
    }

    if (university.trim() === "") {
      setError("Nearby university is required.");
      return;
    }

    if (roomType === "") {
      setError("Please select a room type.");
      return;
    }

    if (gender === "") {
      setError("Please select a gender.");
      return;
    }

    if (furnished === "") {
      setError("Please select whether the property is furnished.");
      return;
    }

    if (availability === "") {
      setError("Please select availability.");
      return;
    }

    setIsSubmitting(true);

    // The real backend API request will be added here later.
    setSuccess("Listing is ready to be submitted.");

    setIsSubmitting(false);
  }

  const amenityOptions = [
    { value: "wifi", label: "Wi-Fi" },
    { value: "electricity", label: "Electricity" },
    { value: "generator", label: "Generator" },
    { value: "kitchen", label: "Kitchen" },
  ];

  return (
    <form onSubmit={handleSubmit} className="listing-form">
      {/* 01 - Property information */}
      <section className="listing-section">
        <div className="listing-section-header">
          <span className="listing-section-number">01</span>

          <div>
            <h2 className="text-heading">Property information</h2>
            <p className="listing-section-description">
              Start with the essential details students will see first.
            </p>
          </div>
        </div>

        <div className="listing-grid">
          <div className="listing-field">
            <label htmlFor="name">Property name</label>
            <input
              className="field"
              id="name"
              type="text"
              placeholder="e.g. Hamra Student Residence"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="listing-field">
            <label htmlFor="price">Monthly price ($)</label>
            <input
              className="field"
              id="price"
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="listing-field listing-field-full">
            <label htmlFor="description">Description</label>
            <textarea
              className="field listing-textarea"
              id="description"
              placeholder="Describe the property, room and what makes it a good fit for students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 02 - Location */}
      <section className="listing-section">
        <div className="listing-section-header">
          <span className="listing-section-number">02</span>

          <div>
            <h2 className="text-heading">Location</h2>
            <p className="listing-section-description">
              Help students understand where the property is located.
            </p>
          </div>
        </div>

        <div className="listing-grid">
          <div className="listing-field">
            <label htmlFor="location">Location</label>
            <input
              className="field"
              id="location"
              type="text"
              placeholder="e.g. Hamra, Beirut"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="listing-field">
            <label htmlFor="university">Nearby university</label>
            <input
              className="field"
              id="university"
              type="text"
              placeholder="e.g. Lebanese American University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 03 - Accommodation details */}
      <section className="listing-section">
        <div className="listing-section-header">
          <span className="listing-section-number">03</span>

          <div>
            <h2 className="text-heading">Accommodation details</h2>
            <p className="listing-section-description">
              Add the details students commonly use when comparing listings.
            </p>
          </div>
        </div>

        <div className="listing-grid listing-grid-three">
          <div className="listing-field">
            <label htmlFor="roomType">Room type</label>
            <select
              className="field"
              id="roomType"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">Select room type</option>
              <option value="single">Single</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          <div className="listing-field">
            <label htmlFor="gender">Gender</label>
            <select
              className="field"
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="listing-field">
            <label htmlFor="furnished">Furnished</label>
            <select
              className="field"
              id="furnished"
              value={furnished}
              onChange={(e) => setFurnished(e.target.value)}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </section>

      {/* 04 - Property photos */}
      <section className="listing-section">
        <div className="listing-section-header">
          <span className="listing-section-number">04</span>

          <div>
            <h2 className="text-heading">Property photos</h2>
            <p className="listing-section-description">
              Add clear photos to help students get a better feel for the
              property.
            </p>
          </div>
        </div>

        <div className="photo-upload-area">
          <input
            id="propertyPhotos"
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handlePhotoChange}
          />

          <label
            htmlFor="propertyPhotos"
            className="photo-upload-label"
          >
            <span
              className="photo-upload-icon"
              aria-hidden="true"
            >
              +
            </span>

            <span className="photo-upload-title">
              Add property photos
            </span>

            <span className="photo-upload-description">
              Choose JPG, PNG or WEBP images
            </span>

            <span className="photo-upload-button">
              Choose photos
            </span>
          </label>
        </div>

        {photos.length > 0 && (
          <>
            <div className="photo-preview-grid">
              {photos.map((photo, index) => (
                <div
                  className="photo-preview"
                  key={`${photo.name}-${index}`}
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Property preview ${index + 1}`}
                  />

                  {index === 0 && (
                    <span className="photo-cover-badge">
                      Cover photo
                    </span>
                  )}

                  <button
                    type="button"
                    className="photo-remove-button"
                    onClick={() => removePhoto(index)}
                    aria-label={`Remove ${photo.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <p className="photo-count">
              {photos.length}{" "}
              {photos.length === 1 ? "photo" : "photos"} selected
            </p>
          </>
        )}
      </section>

      {/* 05 - Amenities */}
      <section className="listing-section">
        <div className="listing-section-header">
          <span className="listing-section-number">05</span>

          <div>
            <h2 className="text-heading">Amenities</h2>
            <p className="listing-section-description">
              Select everything that is available at this property.
            </p>
          </div>
        </div>

        <fieldset className="amenities-fieldset">
          <legend className="sr-only">
            Available amenities
          </legend>

          <div className="amenities-grid">
            {amenityOptions.map((amenity) => {
              const selected = amenities.includes(amenity.value);

              return (
                <label
                  key={amenity.value}
                  className={`amenity-option ${
                    selected ? "amenity-option--selected" : ""
                  }`}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      handleAmenityChange(amenity.value)
                    }
                  />

                  <span
                    className="amenity-check"
                    aria-hidden="true"
                  >
                    {selected ? "✓" : "+"}
                  </span>

                  <span>{amenity.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {/* 06 - Availability and rules */}
      <section className="listing-section">
        <div className="listing-section-header">
          <span className="listing-section-number">06</span>

          <div>
            <h2 className="text-heading">
              Availability & rules
            </h2>
            <p className="listing-section-description">
              Finish with availability and any rules students should know.
            </p>
          </div>
        </div>

        <div className="listing-grid">
          <div className="listing-field">
            <label htmlFor="availability">
              Availability
            </label>

            <select
              className="field"
              id="availability"
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value)
              }
            >
              <option value="">
                Select availability
              </option>
              <option value="available">
                Available
              </option>
              <option value="unavailable">
                Unavailable
              </option>
            </select>
          </div>

          <div className="listing-field listing-field-full">
            <label htmlFor="rules">
              House rules
            </label>

            <textarea
              className="field listing-textarea listing-textarea-small"
              id="rules"
              placeholder="e.g. No smoking, quiet hours after 11 PM..."
              value={rules}
              onChange={(e) =>
                setRules(e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div
          className="listing-message listing-message--error"
          role="alert"
        >
          <span aria-hidden="true">!</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          className="listing-message listing-message--success"
          role="status"
        >
          <span aria-hidden="true">✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* Submit */}
      <div className="listing-submit">
        <div>
          <p className="listing-submit-title">
            Ready to publish?
          </p>

          <p className="text-meta">
            You can review and update your listing later.
          </p>
        </div>

        <button
          className="btn btn-lg listing-submit-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating listing..."
            : "Create listing"}

          {!isSubmitting && (
            <span aria-hidden="true">→</span>
          )}
        </button>
      </div>
    </form>
  );
}