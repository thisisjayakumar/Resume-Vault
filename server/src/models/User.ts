import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  refreshToken: string;
  accessToken?: string;
  accessTokenExpiry?: Date;
  driveFolderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: String,
    refreshToken: { type: String, required: true },
    accessToken: String,
    accessTokenExpiry: Date,
    driveFolderId: String,
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
