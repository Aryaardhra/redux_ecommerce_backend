import express from "express"
import { deleteUser, getAllUsers, login, logout, registerUser, updateProfile, updateRole } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.delete("/deleteuser/:id", deleteUser);
userRouter.get("/getuser",getAllUsers);
userRouter.put("/updateuser/:id", updateRole);
userRouter.patch("/edit-profile", updateProfile);

export default userRouter;