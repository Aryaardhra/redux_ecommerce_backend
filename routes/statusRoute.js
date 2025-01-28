import express from "express";
import { adminStatus, userStatusByEmail } from "../controllers/statusController.js";

const statusRouter = express.Router();

statusRouter.get("/user-status/:email", userStatusByEmail);
statusRouter.get("/admin-status", adminStatus);

export default statusRouter;