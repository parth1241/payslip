import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Organisation } from "@/lib/models/Organisation";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const userId = (session.user as any).userId;
    if (!userId) {
       return NextResponse.json({ error: "User ID missing from session" }, { status: 400 });
    }

    const orgs = await Organisation.find({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
      deletedAt: { $exists: false },
    });

    return NextResponse.json(orgs);
  } catch (error) {
    console.error("GET /api/orgs error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const userId = (session.user as any).userId;
    if (!userId) {
       return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    const body = await req.json();
    const { name, industry } = body;

    if (!name) {
      return NextResponse.json({ error: "Organisation name is required" }, { status: 400 });
    }

    // Auto-generate slug
    let slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Check slug collision
    const existing = await Organisation.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newOrg = await Organisation.create({
      name,
      slug,
      industry,
      ownerId: userId,
      members: [
        {
          userId: userId,
          role: "owner",
          addedAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ success: true, org: newOrg }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orgs error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
