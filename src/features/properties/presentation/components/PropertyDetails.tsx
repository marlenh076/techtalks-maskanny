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
  return (
    <section>
      <h2>{name}</h2>

      <p>{description}</p>

      <p>
        <strong>Monthly Price:</strong> ${price}
      </p>

      <p>
        <strong>Location:</strong> {location}
      </p>

      <p>
        <strong>Nearby University:</strong> {university}
      </p>

      <p>
        <strong>Room Type:</strong> {roomType}
      </p>

      <p>
        <strong>Gender:</strong> {gender}
      </p>

      <p>
        <strong>Furnished:</strong> {furnished}
      </p>

      <p>
        <strong>Availability:</strong> {availability}
      </p>

      <p>
        <strong>Rules:</strong> {rules}
      </p>

      <div>
        <strong>Amenities:</strong>

        <ul>
          {amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}