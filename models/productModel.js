import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    description : {
        type : String, 
        required: true
    },
    price : {
        type : Number,
        required : true,
    },
    oldPrice : {
        type : Number
    },
    image : {
        type : String,
        required : true
    },
    color : {
        type : String
    },
    rating : {
        type : Number,
        default : 0
    },
    author : {
        type : mongoose.Schema.Types.ObjectId, 
        ref: "user",
        required : true
    }
},{
    timestamps : true
}
);

const ProductModel = mongoose.models.product || mongoose.model("product", ProductSchema);
export default ProductModel;