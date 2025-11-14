import { Request, Response } from "express";
import { exchangeCodeForSession } from "../services/googleAuth";

export async function handleGoogleAuth(req: Request, res: Response) {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const result = await exchangeCodeForSession(code);
    return res.json(result);
  } catch (error) {
    console.error("Google auth error", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
