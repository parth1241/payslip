import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      name?: string | null;
      email?: string | null;
      role: string;
      linkedWallet?: string;
      lastLogin?: Date;
    };
  }

  interface User {
    id: string;
    role: string;
    linkedWallet?: string;
    rememberMe?: boolean;
    lastLogin?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    linkedWallet?: string;
    rememberMe?: boolean;
    lastLogin?: Date;
  }
}
