import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: requireEnv("MONGODB_URI"),
  jwtSecret: requireEnv("SERVER_JWT_SECRET"),
  google: {
    clientId: requireEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: requireEnv("GOOGLE_REDIRECT_URI"),
  },
  tokenEncryptionKey: requireEnv("TOKEN_ENCRYPTION_KEY"),
};
