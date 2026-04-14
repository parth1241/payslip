import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { Organisation } from "@/lib/models/Organisation";

type WalletJwtPayload = JwtPayload & { userId?: string };

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  linkedWallet?: string;
  rememberMe?: boolean;
  lastLogin?: Date;
  orgName?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
        walletToken: { label: "Wallet Token", type: "text" }
      },
      async authorize(credentials) {
        await connectDB();
        
        let user;

        // WALLET-TOKEN LOGIN FLOW
        if (credentials?.walletToken) {
           const secret = process.env.NEXTAUTH_SECRET;
           if (!secret) throw new Error("Server auth not configured");
           try {
             const decoded = jwt.verify(credentials.walletToken, secret) as WalletJwtPayload;
             if (!decoded.userId) throw new Error("Invalid wallet payload");
             user = await User.findById(decoded.userId);
             if (!user) throw new Error("Invalid wallet payload");
           } catch {
             throw new Error("Wallet authentication failed");
           }
        } 
        // STANDARD EMAIL/PASSWORD FLOW
        else {
          if (!credentials?.email || !credentials.password) {
            throw new Error("Missing credentials");
          }
          user = await User.findOne({ email: credentials.email.toLowerCase() });
          if (!user) {
            throw new Error("Invalid email or password");
          }
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const diffMin = Math.ceil((user.lockedUntil.getTime() - new Date().getTime()) / 60000);
            throw new Error(`Account locked. Try again in ${diffMin} minutes.`);
          }
          const isMatch = user.passwordHash ? await bcrypt.compare(credentials.password, user.passwordHash) : false;
          if (!isMatch) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
              user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await user.save();
            throw new Error("Invalid email or password");
          }
        }

        // Success: Reset metrics & timestamp
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLogin = new Date();
        await user.save();

        // Fetch primary organisation if employer
        let orgName = undefined;
        if (user.role === "employer") {
          const org = await Organisation.findOne({ 
            $or: [{ ownerId: user._id }, { "members.userId": user._id }] 
          });
          if (org) orgName = org.name;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          linkedWallet: user.linkedWallet,
          rememberMe: credentials?.rememberMe === "true",
          lastLogin: user.lastLogin,
          orgName
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.linkedWallet) {
        token.linkedWallet = session.linkedWallet;
      }
      if (user) {
        const u = user as unknown as AppUser;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.linkedWallet = u.linkedWallet;
        token.rememberMe = u.rememberMe;
        token.lastLogin = u.lastLogin;
        token.orgName = u.orgName;

        if (token.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          userId: token.id as string,
          role: token.role as string,
          linkedWallet: token.linkedWallet as string | undefined,
          lastLogin: token.lastLogin as Date,
          orgName: token.orgName as string | undefined,
          rememberMe: token.rememberMe as boolean
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};
