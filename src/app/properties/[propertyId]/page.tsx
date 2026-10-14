import PropertyDetails from "@/src/features/properties/presentation/components/PropertyDetails";

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  return <PropertyDetails propertyId={propertyId} />;
}
