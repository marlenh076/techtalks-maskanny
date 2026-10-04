import PropertyForm from "../../../features/properties/presentation/components/PropertyForm";

export default function CreatePropertyPage() {
  return (
    <main className="create-listing-page">
      <div className="create-listing-shell">
        <header className="create-listing-header">
          <span className="create-listing-eyebrow">PROPERTY LISTING</span>

          <h1>
            Create a place students
            <br />
            will want to call home.
          </h1>

          <p>
            Add your property details, amenities and availability. You can
            review everything before your listing goes live.
          </p>
        </header>

        <PropertyForm />

        <footer className="create-listing-footer">
          <span>Maskanny</span>
          <p>Student housing, made simpler.</p>
        </footer>
      </div>
    </main>
  );
}
