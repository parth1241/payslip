import type { DefaultSession } from "next-auth";
import type { JWT as _JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      role: string;
      linkedWallet?: string;
      lastLogin?: Date;
      orgName?: string;
      rememberMe?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    linkedWallet?: string;
    lastLogin?: Date;
    orgName?: string;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    linkedWallet?: string;
    lastLogin?: Date;
    orgName?: string;
    rememberMe?: boolean;
    exp?: number;
  }
}
