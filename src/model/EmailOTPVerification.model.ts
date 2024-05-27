import * as mongoose from 'mongoose';

export const EmailOTPVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date },
    expireAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export interface EmailOTPVerificationSchema {
  email: string;
  otp: string;
  createdAt: Date;
  expireAt: Date;
}
