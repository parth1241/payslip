import type { DefaultSession } from "next-auth";


declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      role: string;
      linkedWallet?: string;
      lastLogin?: Date;
      orgName?: string;
      rememberMe?: boolean;
      avatarColor?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    linkedWallet?: string;
    lastLogin?: Date;
    orgName?: string;
    rememberMe?: boolean;
    avatarColor?: string;
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
    avatarColor?: string;
    exp?: number;
  }
}
