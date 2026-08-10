import { Router } from "express";
import { getAudits, createAudit } from "../controllers/audits";

const router = Router();

router.get("/", getAudits);
router.post("/", createAudit);

export default router;
