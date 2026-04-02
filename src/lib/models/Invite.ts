import mongoose, { Schema, Document } from "mongoose";

export interface IInvite extends Document {
  orgId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  invitedEmail: string;
  role: "admin" | "viewer";
  token: string;
  status: "pending" | "accepted" | "revoked";
  expiresAt: Date;
  createdAt: Date;
}

const InviteSchema = new Schema<IInvite>({
  orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  invitedEmail: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ["admin", "viewer"], required: true },
  token: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "revoked"],
    default: "pending",
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Invite =
  mongoose.models.Invite || mongoose.model<IInvite>("Invite", InviteSchema);
