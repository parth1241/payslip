import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { Organisation } from "@/lib/models/Organisation";
import { checkOrgAccess } from "@/lib/checkOrgAccess";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const userId = (session.user as any).userId;
    
    const body = await req.json();
    const { walletAddress, orgId } = body;
    
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Invalid Wallet string param" }, { status: 400 });
    }
    
    // Globally link to the specific User instance safely
    await User.findByIdAndUpdate(userId, { linkedWallet: walletAddress });

    // Ensure the Organisation bounds matches the explicitly executing user natively
    if (orgId) {
      const access = await checkOrgAccess(userId, orgId, "admin");
      if (access.allowed) {
        await Organisation.findByIdAndUpdate(orgId, { walletAddress });
      }
    }

    return NextResponse.json({ success: true, linkedWallet: walletAddress });
  } catch (error) {
    console.error("PATCH /api/user/link-wallet error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
