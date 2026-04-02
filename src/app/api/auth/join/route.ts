import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ joinToken: token });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired join token" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user.passwordHash = hash;
    // Clear the sequence intercept parameter
    user.joinToken = undefined;
    await user.save();

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error("POST /api/auth/join error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
