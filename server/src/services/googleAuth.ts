import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { UserModel } from "../models/User";
import { encrypt, decrypt } from "../utils/crypto";

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

function generateSessionToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: "7d" });
}

export async function exchangeCodeForSession(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.id_token) {
    throw new Error("Google response missing id token");
  }

  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();
  if (!profile.id || !profile.email || !profile.name) {
    throw new Error("Unable to retrieve Google profile information");
  }

  const existingUser = await UserModel.findOne({ googleId: profile.id });
  const refreshToken = tokens.refresh_token
    ? encrypt(tokens.refresh_token)
    : existingUser?.refreshToken;

  if (!refreshToken) {
    throw new Error("Missing refresh token. Ask the user to re-consent with offline access.");
  }

  const user = await UserModel.findOneAndUpdate(
    { googleId: profile.id },
    {
      googleId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      refreshToken,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sessionToken = generateSessionToken(user.id, user.email);
  return {
    token: sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
}

export async function getUserById(userId: string) {
  return UserModel.findById(userId);
}

export function decryptRefreshToken(encrypted: string): string {
  return decrypt(encrypted);
}
