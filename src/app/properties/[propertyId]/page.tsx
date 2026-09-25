import PropertyDetails from "../../../features/properties/presentation/components/PropertyDetails";
import FeaturedListings from "../../../features/properties/presentation/components/FeaturedListings";

type PropertyDetailsPageProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { propertyId } = await params;

  // Temporary property data.
  void propertyId;
  // Later, this will come from the backend API using propertyId.
  const property = {
    name: "Hamra Student Residence",
    description:
      "A furnished student residence located near the university.",
    price: 250,
    location: "Hamra, Beirut",
    university: "Lebanese American University",
    roomType: "Single",
    gender: "Female",
    furnished: "Yes",
    rules: "No smoking.",
    availability: "Available",
    amenities: [
  "Wi-Fi",
  "Electricity",
  "Generator",
  "Private Kitchen",
  "Private Bathroom",
  "Washing Machine",
  "Parking",
  "Air Conditioning",
  "Heating",
  "Elevator",
  "Balcony",
],
  };

  return (
  <main className="property-details-page">
    <PropertyDetails
      name={property.name}
      description={property.description}
      price={property.price}
      location={property.location}
      university={property.university}
      roomType={property.roomType}
      gender={property.gender}
      furnished={property.furnished}
      rules={property.rules}
      availability={property.availability}
      amenities={property.amenities}
    />

    <FeaturedListings />
  </main>
);
}