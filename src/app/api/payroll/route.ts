import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { checkOrgAccess } from "@/lib/checkOrgAccess";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

    const userId = (session.user as any).userId;
    await connectDB();

    const access = await checkOrgAccess(userId, orgId, "viewer");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    // Returning empty payload natively since Payroll currently traces 1:1 on-chain.
    // Replace this later with native PaymentRecord database bindings if shifted off-chain.
    return NextResponse.json([]);
  } catch (error) {
    console.error("GET /api/payroll error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
