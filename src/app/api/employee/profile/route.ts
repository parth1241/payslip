import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Explicit server-side payload boundary matching user explicitly 
    const userId = (session.user as any).id || (session.user as any).userId;
    await connectDB();

    const user = await User.findById(userId).select("name email linkedWallet avatarColor role");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET api/employee/profile error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id || (session.user as any).userId;
    const body = await req.json();
    
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Patch valid fields
    if (body.name) user.name = body.name;
    if (body.avatarColor) user.avatarColor = body.avatarColor;
    if (body.linkedWallet) user.linkedWallet = body.linkedWallet;

    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("PATCH api/employee/profile error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
