import { Router } from "express";
import {
  getNewsletters,
  getPublishedNewsletters,
  getNewsletterByIdOrSlug,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
} from "../controllers/newsletters";

const router = Router();

router.get("/", getNewsletters);
router.get("/published", getPublishedNewsletters);
router.get("/:idOrSlug", getNewsletterByIdOrSlug);
router.post("/", createNewsletter);
router.put("/:id", updateNewsletter);
router.delete("/:id", deleteNewsletter);

export default router;
