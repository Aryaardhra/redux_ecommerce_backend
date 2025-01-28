import express from "express";
import { createReview, getReview, reviewCount } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/post-review", createReview);
reviewRouter.get("/total-reviews", reviewCount);
reviewRouter.get("/:userId", getReview)

export default reviewRouter;