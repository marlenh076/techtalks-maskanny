import { NextResponse } from "next/server";
import { z } from "zod";
import { PropertyRepository } from "@/src/features/properties/repository/property.repository";
import { HostContactRepository } from "@/src/features/properties/repository/host_contact.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
  }

  try {
    const property = await new PropertyRepository().getById(id);
    if (!property || property.approval_status !== "approved") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const contact = await new HostContactRepository().getByHostId(property.host_id);
    if (!contact) {
      return NextResponse.json({ error: "Host contact unavailable" }, { status: 404 });
    }

    return NextResponse.json(contact, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to fetch host contact", error);
    return NextResponse.json({ error: "Failed to fetch host contact" }, { status: 500 });
  }
}
