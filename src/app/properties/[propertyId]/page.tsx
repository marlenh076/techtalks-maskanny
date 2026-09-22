import PropertyDetails from "../../../features/Property/presentation/components/PropertyDetails";

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
  // Later, this will come from the backend API using propertyId.
  const property = {
    name: "Hamra Student Residence",
    description: "A furnished student residence located near the university.",
    price: 250,
    location: "Hamra, Beirut",
    university: "Lebanese American University",
    roomType: "Single",
    gender: "Female",
    furnished: "Yes",
    rules: "No smoking.",
    availability: "Available",
    amenities: ["Wi-Fi", "Electricity", "Generator", "Kitchen"],
  };

  return (
    <main>
      <h1>Property Details</h1>

      <p>Property ID: {propertyId}</p>

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
    </main>
  );
}