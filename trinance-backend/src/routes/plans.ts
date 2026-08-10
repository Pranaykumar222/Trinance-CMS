import { Router } from "express";
import { getPlans, updatePlan } from "../controllers/plans";

const router = Router();

router.get("/", getPlans);
router.put("/:id", updatePlan);

export default router;
