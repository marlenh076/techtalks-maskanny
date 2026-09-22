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

  return (
    <form onSubmit={handleSubmit}>
      <h2>Property Information</h2>

      <div>
        <label htmlFor="name">Property Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>s
        <label htmlFor="price">Monthly Price ($)</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="university">Nearby University</label>
        <input
          id="university"
          type="text"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="roomType">Room Type</label>
        <select
          id="roomType"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="">Select room type</option>
          <option value="single">Single</option>
          <option value="shared">Shared</option>
        </select>
      </div>

      <div>
        <label htmlFor="gender">Gender</label>
        <select
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

      <div>
        <label htmlFor="furnished">Furnished</label>
        <select
          id="furnished"
          value={furnished}
          onChange={(e) => setFurnished(e.target.value)}
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="rules">Rules</label>
        <textarea
          id="rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="availability">Availability</label>
        <select
          id="availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="">Select availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <div>
        <p>Amenities</p>

        <label>
          <input
            type="checkbox"
            checked={amenities.includes("wifi")}
            onChange={() => handleAmenityChange("wifi")}
          />
          Wi-Fi
        </label>

        <label>
          <input
            type="checkbox"
            checked={amenities.includes("electricity")}
            onChange={() => handleAmenityChange("electricity")}
          />
          Electricity
        </label>

        <label>
          <input
            type="checkbox"
            checked={amenities.includes("generator")}
            onChange={() => handleAmenityChange("generator")}
          />
          Generator
        </label>

        <label>
          <input
            type="checkbox"
            checked={amenities.includes("kitchen")}
            onChange={() => handleAmenityChange("kitchen")}
          />
          Kitchen
        </label>
      </div>

      {error && <p>{error}</p>}

      {success && <p>{success}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating Listing..." : "Create Listing"}
      </button>
    </form>
  );
}