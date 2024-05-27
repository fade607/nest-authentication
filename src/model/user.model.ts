import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
}
