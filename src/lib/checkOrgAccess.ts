import { Organisation } from "./models/Organisation";

type OrgMemberLike = {
  userId?: { toString: () => string } | string;
  role?: string;
};

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

    const member = (org.members as unknown[]).find((m) => {
      const mm = m as OrgMemberLike;
      const id = typeof mm.userId === "string" ? mm.userId : mm.userId?.toString?.();
      return id === userId;
    }) as OrgMemberLike | undefined;
    if (!member) {
      return { allowed: false, reason: "not a member" };
    }

    const levels: Record<"viewer" | "admin" | "owner", number> = {
      viewer: 0,
      admin: 1,
      owner: 2,
    };

    const role = member.role ?? "viewer";
    if (levels[role as keyof typeof levels] >= levels[required]) {
      return { allowed: true, userRole: role };
    }

    return { allowed: false, reason: "insufficient role" };
  } catch {
    return { allowed: false, reason: "server error" };
  }
}
