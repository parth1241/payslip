import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing password parameters" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const userId =
      (session.user as { id?: string; userId?: string }).id ||
      (session.user as { id?: string; userId?: string }).userId;
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.passwordHash) {
       return NextResponse.json({ error: "Account lacks an active password mapping!" }, { status: 400 });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
       return NextResponse.json({ error: "Incorrect current password" }, { status: 403 });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH api/user/password error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
