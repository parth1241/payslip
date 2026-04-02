import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  walletAddress: string;
  salary: number;
  status: "active" | "pending" | "inactive";
  lastPaid?: string;
  orgId: mongoose.Types.ObjectId;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true },
  salary: { type: Number, required: true },
  status: { type: String, enum: ["active", "pending", "inactive"], default: "active" },
  lastPaid: { type: String },
  orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true, index: true },
});

export const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
