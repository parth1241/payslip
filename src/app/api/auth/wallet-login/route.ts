import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ linkedWallet: walletAddress, role: "employee" });
    if (!user) {
      return NextResponse.json({ error: "No employee account linked to this wallet. Please sign up first." }, { status: 404 });
    }

    // Explicitly generate a temporary token specifically evaluating immediate injection
    const secret = process.env.NEXTAUTH_SECRET || "default_local_secret";
    const walletToken = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: '5m' });

    return NextResponse.json({ email: user.email, token: walletToken });
  } catch (error) {
    console.error("Wallet login check failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
