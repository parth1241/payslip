import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import JoinClientFlow from "./JoinClientFlow";

export default async function JoinPage({ params }: { params: { token: string } }) {
  await connectDB();
  const user = await User.findOne({ joinToken: params.token });
  
  if (!user) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
          <div className="p-8 bg-card border border-border/20 rounded-xl shadow-xl max-w-md w-full text-center space-y-4">
             <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
               <span className="text-red-500 text-xl font-bold">!</span>
             </div>
             <h2 className="text-xl font-bold">Invalid Invite</h2>
             <p className="text-[13px] text-muted-foreground">This invitation link is invalid or has already been used to create an account.</p>
          </div>
       </div>
    );
  }

  return (
    <JoinClientFlow 
      token={params.token} 
      name={user.name} 
      email={user.email} 
    />
  );
}
