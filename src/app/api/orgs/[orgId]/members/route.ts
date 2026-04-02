import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Organisation } from "@/lib/models/Organisation";
import { checkOrgAccess } from "@/lib/checkOrgAccess";
import { Invite } from "@/lib/models/Invite";
// Need to import User so Mongoose can resolve the populate() ref
import { User } from "@/lib/models/User"; 

export async function GET(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const requesterId = (session.user as any).userId;

    const access = await checkOrgAccess(requesterId, params.orgId, "viewer");
    if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: 403 });

    // Ensure User model is loaded purely so it doesn't crash
    if (!User) console.log("Init User");

    const org = await Organisation.findById(params.orgId).populate("members.userId", "name email avatarColor lastLogin");
    const invites = await Invite.find({ orgId: params.orgId, status: "pending" });

    return NextResponse.json({ 
      members: org.members,
      invites 
    });
  } catch (error) {
    console.error("GET members error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
