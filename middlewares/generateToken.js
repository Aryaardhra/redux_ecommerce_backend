import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

const generateToken = async(userId) => {
    try {
        const user = await userModel.findById(userId);
        if(!user) {
            throw new Error("user not found")
        }

        const token = jwt.sign({ userId : user._id, role : user.role}, process.env.JWT_SECRET, {expiresIn: "1h"});
        return token;
    } catch (error) {
        
    }
}

export default generateToken;