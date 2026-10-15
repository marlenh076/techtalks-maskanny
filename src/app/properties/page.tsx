import { ListingsBrowser } from "@/src/features/properties/presentation/components/ListingsBrowser";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await searchParams;
  return (
    <ListingsBrowser searchParams={filters} />
  );
}
