import { getServerSession } from "next-auth";
export const dynamic = 'force-dynamic';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Invite } from "@/lib/models/Invite";
import { Organisation } from "@/lib/models/Organisation";
import ClientApprove from "./ClientApprove";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const invite = await Invite.findOne({ token, status: "pending" });
  
  if (!invite || invite.expiresAt < new Date()) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="p-8 bg-card border border-border/20 rounded-xl shadow-xl max-w-md w-full text-center space-y-4">
             <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
               <span className="text-red-500 text-xl font-bold">!</span>
             </div>
             <h2 className="text-xl font-bold">Invalid Invite</h2>
             <p className="text-muted-foreground text-sm">This invitation link has expired or is no longer valid. Please contact your administrator for a new link.</p>
          </div>
       </div>
    );
  }

  const org = await Organisation.findById(invite.orgId);
  const orgName = org?.name || "an Organisation";

  return (
    <ClientApprove 
      token={token} 
      requiresLogin={!session} 
      orgName={orgName} 
      role={invite.role} 
    />
  );
}
