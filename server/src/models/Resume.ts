import mongoose, { Schema } from "mongoose";

export interface IResume extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: Date;
  versionLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileId: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    createdTime: { type: Date, required: true },
    versionLabel: String,
  },
  { timestamps: true }
);

ResumeSchema.index({ user: 1, createdTime: -1 });

export const ResumeModel = mongoose.model<IResume>("Resume", ResumeSchema);
