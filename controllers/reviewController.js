import ProductModel from "../models/ProductModel.js";
import ReviewModel from "../models/reviewsModel.js";


const createReview = async (req, res) => {
try {
     const { comment, rating, productId, userId } = req.body;

     if (!comment || !rating || !productId || !userId) {
        return res.status(400).send({ message : "All fields are required"});
     }

     const existingReview = await ReviewModel.findOne({ productId, userId });

     if(existingReview) {
        //update reviews

        existingReview.comment = comment;
        existingReview.rating = rating;
        await existingReview.save();
     } else {
        // create new review

        const newReview = new ReviewModel({
            comment,
            rating,
            productId,
            userId
        });
        await newReview.save();
     }

     // calculate the average rating

     const reviews = await ReviewModel.find({ productId });
     if(reviews.length > 0) {
        const totalRating = reviews.reduce((acc, review) => acc + review.rating,0);
const averageRating = totalRating /reviews.length;
const product = await ProductModel.findById(productId);
if(product){
    product.rating = averageRating;
    await product.save({ validateBeforeSave : false });
} else {
    return res.status(404).send({ message : "Product not found"})
}
     }

     res.status(200).send({message : "Review processed successfully", reviews:reviews })
} catch (error) {
    console.error("Error while posting review", error);
    res.status(500).send({ message: "Failed to post review" });
}
}  

//total reviews count 

const reviewCount = async (req, res) => {
    try {
        
        const totalReviews = await ReviewModel.countDocuments({});
        res.status(200).send({ totalReviews });
    } catch (error) {
        console.error("Error while getting total review", error);
    res.status(500).send({ message: "Failed to get review count" });
    }
}

//get reviews by userid

const getReview = async(req, res) => {
    const {userId} =req.params;
    if(!userId) {
        return res.status(400).send({ message : "userId is required"})
    }
    try {
         const reviews = await ReviewModel.find({ userId : userId }).sort({ createdAt : -1 });
         if(reviews.length === 0){
            return res.status(404).send({ message : "NO reviews found"});
         }
      res.status(200).send(reviews)
    } catch (error) {
        console.error("Error while fetching reviews by user", error);
        res.status(500).send({ message: "Failed to fetch reviews by user" });
    }
}

export { createReview, reviewCount, getReview }