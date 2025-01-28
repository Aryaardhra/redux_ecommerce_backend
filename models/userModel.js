import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username : {
        type : String,
        require: true,
        unique: true 
    },
    email : {
        type: String,
        require: true,
        unique: true 
    },
    password : {
        type: String,
        require: true,
        unique: true 
    },
    role : {
        type : String,
        default : "user"
    },
    profileImage : String,
    bio : {
        type : String,
        maxlength: 200
    },
    profession : String,
    createdAt : {
        type : Date,
        default : Date.now
    }
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;