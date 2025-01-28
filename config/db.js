import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to mongodb");
    } catch (error) {
        throw(error);
    }
};

export default connectDB;