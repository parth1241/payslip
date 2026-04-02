import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { checkOrgAccess } from "@/lib/checkOrgAccess";
import { Organisation } from "@/lib/models/Organisation";

export async function PATCH(
  req: Request,
  { params }: { params: { orgId: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const requesterId = (session.user as any).userId;

    // Only owner can change roles
    const access = await checkOrgAccess(requesterId, params.orgId, "owner");
    if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: 403 });

    const { role } = await req.json();
    if (!role || !["admin", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await Organisation.findOneAndUpdate(
      { _id: params.orgId, "members.userId": params.userId },
      { $set: { "members.$.role": role } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH member error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orgId: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const requesterId = (session.user as any).userId;

    const access = await checkOrgAccess(requesterId, params.orgId, "owner");
    if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: 403 });

    await Organisation.findByIdAndUpdate(params.orgId, {
      $pull: { members: { userId: params.userId } },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE member error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
