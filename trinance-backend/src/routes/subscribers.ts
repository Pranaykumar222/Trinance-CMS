import { Router } from "express";
import { getSubscribers, updateSubscriber, deleteSubscriber } from "../controllers/subscribers";

const router = Router();

router.get("/", getSubscribers);
router.put("/:id", updateSubscriber);
router.delete("/:id", deleteSubscriber);

export default router;
