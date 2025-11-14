import { Router } from "express";
import { handleGoogleAuth } from "../controllers/authController";

const router = Router();

router.post("/google", handleGoogleAuth);

export default router;
