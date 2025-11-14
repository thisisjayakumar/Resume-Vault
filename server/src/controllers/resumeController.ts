import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { uploadToDrive, listDriveFiles, downloadFromDrive, deleteFromDrive } from "../services/googleDrive";
import { ResumeModel } from "../models/Resume";

export async function listResumes(req: AuthenticatedRequest, res: Response) {
  try {
    const resumes = await ResumeModel.find({ user: req.userId }).sort({ createdTime: -1 });
    return res.json({ resumes });
  } catch (error) {
    console.error("List resumes error", error);
    return res.status(500).json({ error: "Failed to list resumes" });
  }
}

export async function uploadResume(req: AuthenticatedRequest, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    const driveFile = await uploadToDrive(req.user!, file);
    const resume = await ResumeModel.create({
      user: req.userId,
      fileId: driveFile.id,
      name: driveFile.name,
      mimeType: driveFile.mimeType,
      size: Number(driveFile.size),
      createdTime: new Date(driveFile.createdTime!),
    });

    return res.json({ resume });
  } catch (error) {
    console.error("Upload resume error", error);
    return res.status(500).json({ error: "Failed to upload resume" });
  }
}

export async function downloadResume(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const resume = await ResumeModel.findOne({ _id: id, user: req.userId });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const stream = await downloadFromDrive(req.user!, resume.fileId);
    res.setHeader("Content-Type", resume.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${resume.name}"`);
    stream.pipe(res);
  } catch (error) {
    console.error("Download resume error", error);
    return res.status(500).json({ error: "Failed to download resume" });
  }
}

export async function deleteResume(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const resume = await ResumeModel.findOne({ _id: id, user: req.userId });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    await deleteFromDrive(req.user!, resume.fileId);
    await ResumeModel.deleteOne({ _id: id });
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete resume error", error);
    return res.status(500).json({ error: "Failed to delete resume" });
  }
}
