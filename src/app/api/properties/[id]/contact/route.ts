import { NextResponse } from "next/server";
import { z } from "zod";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { HostContactRepository } from "@/src/features/properties/repository/host_contact.repository";
import { hostContactSchema } from "@/src/features/properties/models/host_contact.model";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
  }

  try {
    // Public-key property reads enforce effective-live RLS before the server-only,
    // narrowly scoped host contact lookup. Never resolve a caller-supplied host ID.
    const property = await new PropertyRepository().getById(id);
    if (!property || property.approval_status !== "approved") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const contact = await new HostContactRepository().getByHostId(property.host_id);
    if (!contact) {
      return NextResponse.json({ error: "Host contact unavailable" }, { status: 404 });
    }

    return NextResponse.json(hostContactSchema.parse(contact), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to fetch host contact", error);
    return NextResponse.json({ error: "Failed to fetch host contact" }, { status: 500 });
  }
}
