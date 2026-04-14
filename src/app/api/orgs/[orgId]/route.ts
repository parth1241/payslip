import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Organisation } from "@/lib/models/Organisation";
import { checkOrgAccess } from "@/lib/checkOrgAccess";

export async function PATCH(
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

    // Must be admin or owner
    const access = await checkOrgAccess(userId, params.orgId, "admin");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const updates = (await req.json()) as {
      name?: string;
      industry?: string;
      settings?: unknown;
    };
    
    // Whitelist updatable fields
    const { name, industry, settings } = updates;
    const patchData: Record<string, unknown> = {};
    if (name) patchData.name = name;
    if (industry) patchData.industry = industry;
    if (settings) patchData.settings = settings;

    const updatedOrg = await Organisation.findByIdAndUpdate(
      params.orgId,
      { $set: patchData },
      { new: true }
    );

    return NextResponse.json({ success: true, org: updatedOrg });
  } catch (error) {
    console.error("PATCH /api/orgs/[id] error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Must be owner
    const access = await checkOrgAccess(userId, params.orgId, "owner");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    await Organisation.findByIdAndUpdate(params.orgId, {
      $set: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Organisation deleted" });
  } catch (error) {
    console.error("DELETE /api/orgs/[id] error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
