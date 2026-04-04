import { Organisation } from "./models/Organisation";

export async function checkOrgAccess(
  userId: string,
  orgId: string,
  required: "viewer" | "admin" | "owner"
): Promise<{ allowed: boolean; reason?: string; userRole?: string }> {
  try {
    const org = await Organisation.findById(orgId);
    if (!org || org.deletedAt) {
      return { allowed: false, reason: "not found" };
    }

    if (org.ownerId.toString() === userId) {
      return { allowed: true, userRole: "owner" };
    }

    const member = org.members.find((m: unknown) => (m as any).userId.toString() === userId);
    if (!member) {
      return { allowed: false, reason: "not a member" };
    }

    const levels: Record<"viewer" | "admin" | "owner", number> = {
      viewer: 0,
      admin: 1,
      owner: 2,
    };

    if (levels[(member as any).role as keyof typeof levels] >= levels[required]) {
      return { allowed: true, userRole: (member as any).role };
    }

    return { allowed: false, reason: "insufficient role" };
  } catch (_err) {
    return { allowed: false, reason: "server error" };
  }
}
