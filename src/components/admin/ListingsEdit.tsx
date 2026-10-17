"use client";
import { useState } from "react";
import type { Property } from "@/src/features/properties/models/property.model";
import { adminApi } from "@/src/features/admin/client/api";
import { useAdminAction } from "@/src/features/admin/client/hooks";
import { AdminModal, QueryState, buttonClass, inputClass } from "./AdminUI";

export default function EditListingModal({
  listing,
  onClose,
  onSaved,
}: {
  listing: Property;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(listing.title);
  const [type, setType] = useState(listing.property_type);
  const [price, setPrice] = useState(String(listing.price));
  const [reason, setReason] = useState("");
  const action = useAdminAction();
  const changed =
    title.trim() !== listing.title ||
    type !== listing.property_type ||
    Number(price) !== listing.price;
  return (
    <AdminModal title="Edit Listing Details" onClose={onClose} busy={action.pending}>
      <p className="text-[11px] text-brand-slate break-all">Ref: {listing.property_id}</p>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const changes: {
            title?: string;
            property_type?: Property["property_type"];
            price?: number;
          } = {};
          if (title.trim() !== listing.title) changes.title = title.trim();
          if (type !== listing.property_type) changes.property_type = type;
          if (Number(price) !== listing.price) changes.price = Number(price);
          const result = await action.run(() =>
            adminApi.edit(listing.property_id, { reason, changes }),
          );
          if (result.ok) onSaved();
        }}
      >
        <label className="block text-xs font-bold">
          Property Name / Title
          <input
            required
            maxLength={200}
            value={title}
            disabled={action.pending}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass + " mt-2"}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-xs font-bold">
            Property Type
            <select
              value={type}
              disabled={action.pending}
              onChange={(event) => setType(event.target.value as Property["property_type"])}
              className={inputClass + " mt-2"}
            >
              <option value="apartment">Apartment</option>
              <option value="studio">Studio</option>
              <option value="dorm">Dormitory</option>
            </select>
          </label>
          <label className="block text-xs font-bold">
            Monthly Price ($)
            <input
              type="number"
              min="0.01"
              max="999999999.99"
              step="any"
              required
              value={price}
              disabled={action.pending}
              onChange={(event) => setPrice(event.target.value)}
              className={inputClass + " mt-2"}
            />
          </label>
        </div>
        <label className="block text-xs font-bold">
          Reason for this edit
          <textarea
            required
            maxLength={1000}
            value={reason}
            disabled={action.pending}
            onChange={(event) => setReason(event.target.value)}
            className={inputClass + " mt-2"}
          />
        </label>
        <QueryState error={action.error} />
        <div className="pt-4 border-t border-brand-slate/10 flex justify-end gap-2">
          <button
            type="button"
            disabled={action.pending}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-brand-slate/20"
          >
            Cancel
          </button>
          <button disabled={action.pending || !changed || !reason.trim()} className={buttonClass}>
            {action.pending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
