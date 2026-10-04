import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { UserRepository } from "@/src/features/users/repository/user.repository";
import { UserService } from "@/src/features/users/service/user";
import { userUpdateSchema } from "@/src/features/users/validation/user.schema";
import { getCurrentUser, getAccessToken } from "@/src/lib/supabase/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userRepository = new UserRepository(token);
    const userService = new UserService(userRepository);

    const user = await userService.getById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);

    if (body === null) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = userUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid user data",
          details: result.error.issues,
        },
        { status: 400 },
      );
    }

    const userRepository = new UserRepository(token);
    const userService = new UserService(userRepository);

    const existingUser = await userService.getById(id);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await userService.update(id, result.data);

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
