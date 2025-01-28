import validator from "validator";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import generateToken from "../middlewares/generateToken.js";
///register

const registerUser = async (req, res) => {
try {
    const { username, email, password } = req.body;

        //checking user already exists or not
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({ success : false, message : "User already exists"});
        }

        //validating email format and strong password

        if (!validator.isEmail(email)){
            return res.json({ success : false, message : "Please enter a valid email"})
        }
        if (password.length < 8) {
            return res.json({ success : false, message: "Please enter a strong password"})
        }

            //hashing user password 
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);
    
            const newUser = new userModel({
                username,
                email,
                password : hashedPassword
            })
    
            const user = await newUser.save();
            res.status(201).send({ success : true})
} catch (error) {
    console.error("Error registering user", error);
    res.status(500).send({ message: "Error registering user" });
}
}   

//login user

const login = async(req, res) => {

  
try {
    
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(401).send({ message : "user not found"})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if(!isMatch) {
        return res.status(401).send({ message: "password not matched"})
    }
    const token = await generateToken(user._id);

    res.cookie("token", token, {
        httpOnly: true,
        secure:true,
        sameSite: "None"
    })

    res.status(200).send({message:"Successfully logged in ",token,  user : {
        _id : user._id,
        email: user.email,
        username : user.username,
        role : user.role,
       /* profileImage : user.profileImage,
        bio : user.bio,
        profession : user.profession*/
    }})
} catch (error) {
    console.error("Error while login", error);
    res.status(500).send({ message: "Error while login" });
}
}

//logout

const logout = async(req,res) => {
    res.clearCookie("token");
    res.status(200).send({ message: "Logged out successfully" });
}

//delete a user

const deleteUser = async (req, res) => {
try {
    const {id} = req.params;
    const user = await userModel.findByIdAndDelete(id);

    if(!user) {
        return res.status(404).send({ message : "User not found"})
    }
    res.status(200).send({ message : "user deleted successfully"})
} catch (error) {
    console.error("Error while deleting", error);
    res.status(500).send({ message: "Error while deleting" });
}
}

//get all users

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, "id email role").sort({ createdAt : -1 });
        res.status(200).send(users)
    } catch (error) {
        console.error("Error while fetching the users", error);
    res.status(500).send({ message: "Error while fetching the users" });
    }
}

//update user role

const updateRole = async(req,res) => {
    try {
        const {id} = req.params;
        const {role} = req.body;
        const user = await userModel.findByIdAndUpdate(id, {role}, {new: true});
        if (!user) {
            return res.status(404).send({ message : "user not found"})
        }
        res.status(200).send({ message : "user role updated successfully", user});
    } catch (error) {
        console.error("Error while updating user role", error);
    res.status(500).send({ message: "Error while updating user role" });
    }
}

//edit or update profile

const updateProfile = async(req, res) => {
    try {
        const {userId, username, email, profileImage, bio, profession} = req.body;

        if(!userId) {
            return res.status(400).send({ message : "User ID is required"})
        }

        const user = await userModel.findById(userId);

        if(!user) {
            return res.status(400).send({ message : "User not found"})
        }

        //update profile

        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if(profileImage !== undefined) user.profileImage = profileImage;
        if(bio !== undefined) user.bio = bio;
        if(profession !== undefined) user.profession = profession;

        await user.save();
        res.status(200).send({
            message: "Profile updated successfully",
            user : {
                _id : user._id,
                username : user.username,
                email : user.email,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,
                role: user.role,
            }
        })
    } catch (error) {
        console.error("Error while  updating user profile", error);
    res.status(500).send({ message: "Error while updating user profile" }); 
    }
}
export { registerUser, login, logout, deleteUser, getAllUsers,updateRole, updateProfile }