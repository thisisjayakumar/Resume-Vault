import { google } from "googleapis";
import stream from "stream";
import { config } from "../config/env";
import { IUser, UserModel } from "../models/User";
import { decryptRefreshToken } from "./googleAuth";

function createOAuthClient() {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

async function getAuthorizedDrive(user: IUser) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: decryptRefreshToken(user.refreshToken) });
  return google.drive({ version: "v3", auth: client });
}

export async function ensureUserFolder(user: IUser) {
  if (user.driveFolderId) {
    return user.driveFolderId;
  }

  const drive = await getAuthorizedDrive(user);
  const folderName = "Resume Versions";

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  const folderId = folder.data.id as string;
  user.driveFolderId = folderId;
  await user.save();
  return folderId;
}

export async function uploadToDrive(user: IUser, file: Express.Multer.File) {
  const drive = await getAuthorizedDrive(user);
  const folderId = await ensureUserFolder(user);
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [folderId],
      mimeType: file.mimetype,
    },
    media: {
      mimeType: file.mimetype,
      body: bufferStream,
    },
    fields: "id, name, mimeType, size, createdTime",
  });

  return response.data;
}

export async function listDriveFiles(user: IUser) {
  const drive = await getAuthorizedDrive(user);
  const folderId = await ensureUserFolder(user);

  const response = await drive.files.list({
    q: ` in parents and trashed=false`,
    fields: "files(id, name, createdTime, mimeType, size)",
    orderBy: "createdTime desc",
  });

  return response.data.files ?? [];
}

export async function downloadFromDrive(user: IUser, fileId: string) {
  const drive = await getAuthorizedDrive(user);
  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "stream" }
  );

  return response.data as NodeJS.ReadableStream;
}

export async function deleteFromDrive(user: IUser, fileId: string) {
  const drive = await getAuthorizedDrive(user);
  await drive.files.delete({ fileId });
}
