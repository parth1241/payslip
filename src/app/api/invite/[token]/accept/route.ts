import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Invite } from "@/lib/models/Invite";
import { Organisation } from "@/lib/models/Organisation";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const userId = (session.user as any).userId;

    const invite = await Invite.findOne({ token: params.token, status: "pending" });
    if (!invite || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite invalid or expired" }, { status: 400 });
    }

    // Verify user isn't already a member
    const org = await Organisation.findById(invite.orgId);
    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }
    const exists = org.members.some((m: any) => m.userId.toString() === userId);
    if (exists) {
      invite.status = 'revoked'; // Invalidate if they bypass constraints
      await invite.save();
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    await Organisation.findByIdAndUpdate(invite.orgId, {
      $push: {
        members: {
          userId,
          role: invite.role,
          addedAt: new Date()
        }
      }
    });

    invite.status = 'accepted';
    await invite.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/invite/[token]/accept error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
