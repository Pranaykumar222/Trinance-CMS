import { Router } from "express";
import newslettersRouter from "./newsletters";
import subscribersRouter from "./subscribers";
import usersRouter from "./users";
import plansRouter from "./plans";
import auditsRouter from "./audits";

const router = Router();

router.use("/newsletters", newslettersRouter);
router.use("/subscribers", subscribersRouter);
router.use("/users", usersRouter);
router.use("/plans", plansRouter);
router.use("/audit", auditsRouter);

export default router;
