import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { checkOrgAccess } from "@/lib/checkOrgAccess";
import { Invite } from "@/lib/models/Invite";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const userId = (session.user as { userId?: string }).userId; if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const access = await checkOrgAccess(userId, params.orgId, "admin");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72H
    
    await Invite.create({
      orgId: params.orgId,
      invitedBy: userId,
      invitedEmail: email,
      role,
      token,
      expiresAt
    });
    
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`;
    console.log(`\n=== INVITE LINK ===\n${inviteUrl}\n==================\n`);

    return NextResponse.json({ success: true, inviteUrl }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orgs/[id]/invite error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
