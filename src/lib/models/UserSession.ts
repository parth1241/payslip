import mongoose, { Document, Schema } from 'mongoose';

export interface UserSession extends Document {
  userId: mongoose.Types.ObjectId;
  deviceName: string;
  browser: string;
  ip: string;
  createdAt: Date;
  lastActive: Date;
  sessionTokenHash: string;
}

const UserSessionSchema = new Schema<UserSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deviceName: { type: String, required: true },
  browser: { type: String, required: true },
  ip: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  sessionTokenHash: { type: String, required: true },
});

export const UserSessionModel = mongoose.models.UserSession || mongoose.model<UserSession>('UserSession', UserSessionSchema);
