import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { listResumes, uploadResume, downloadResume, deleteResume } from "../controllers/resumeController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", requireAuth, listResumes);
router.post("/", requireAuth, upload.single("resume"), uploadResume);
router.get("/:id/download", requireAuth, downloadResume);
router.delete("/:id", requireAuth, deleteResume);

export default router;
