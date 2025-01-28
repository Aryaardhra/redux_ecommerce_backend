import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({

    comment : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
         required : true,
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
        required : true,
    },
},
{ timestamps : true }
);

const ReviewModel = mongoose.models.review || mongoose.model("review", ReviewSchema);
export default ReviewModel;