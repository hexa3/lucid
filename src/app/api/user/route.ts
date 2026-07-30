import { NextRequest, NextResponse } from "next/server";
import { upsertUser, getUser, getAllUsers } from "@/lib/store";
import { UserProfile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, interest_tags, reading_level, accessibility } = body;

    if (!id || !name || !interest_tags) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, interest_tags", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!Array.isArray(interest_tags) || interest_tags.length === 0) {
      return NextResponse.json(
        { error: "interest_tags must be a non-empty array", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const user: UserProfile = {
      id,
      name,
      interest_tags,
      reading_level: reading_level ?? "standard",
      accessibility: {
        highContrast: accessibility?.highContrast ?? false,
        dyslexiaFont: accessibility?.dyslexiaFont ?? false,
        textToSpeech: accessibility?.textToSpeech ?? false,
      },
    };

    upsertUser(user);

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("User save error:", error);
    return NextResponse.json(
      { error: "Failed to save user profile.", code: "STORE_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (userId) {
      const user = getUser(userId);
      if (!user) {
        return NextResponse.json(
          { error: "User not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: user });
    }

    // Return all users (for teacher dashboard)
    return NextResponse.json({ data: { users: getAllUsers() } });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user.", code: "STORE_ERROR" },
      { status: 500 }
    );
  }
}
