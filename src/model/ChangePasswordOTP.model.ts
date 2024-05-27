import * as mongoose from 'mongoose';
import { ObjectId } from 'mongoose';
export const ChangePasswordOTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expireAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export interface ChangePasswordOTP {
  email: string;
  otp: string;
  createdAt: Date;
  expireAt: Date;
}
