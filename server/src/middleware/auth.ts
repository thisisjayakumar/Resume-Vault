import { NextFunction, Request, Response } from "express";
import { verifySessionToken, getUserById } from "../services/googleAuth";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: Awaited<ReturnType<typeof getUserById>>;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  try {
    const token = authHeader.substring(7);
    const payload = verifySessionToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
