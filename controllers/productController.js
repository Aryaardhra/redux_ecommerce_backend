
import ProductModel from "../models/ProductModel.js";
import ReviewModel from "../models/reviewsModel.js";


//to create a product

const createProduct = async (req, res) => {

    try {
        const newProduct = await new ProductModel({
            ...req.body,
        });

        const savedProduct = await newProduct.save();

        //calculate review

        const reviews = await ReviewModel.find({ productId : savedProduct._id });
        if(reviews.length > 0 ) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            savedProduct.rating = averageRating;
            await savedProduct.save();
        }
        res.status(201).send(savedProduct);
    } catch (error) {
        console.error("Error while creating new product", error);
        res.status(500).send({ message: "Failed to create new product" });
    }
};

//get all products

const getAllProducts = async (req, res) => {
    try {
        
        const { category, color, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        const filter = {};

        if ( category && category !== "all" ) {
            filter.category = category;
        };

        if ( color && color !== "all" ) {
            filter.color = color;
        };

        if ( minPrice && maxPrice ) {
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            if ( !isNaN(min) && !isNaN(max)) {
                filter.price = { $gte : min, $lte : max };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalProducts = await ProductModel.countDocuments(filter);
        const totalPages = Math.ceil( totalProducts/parseInt(limit));

        const products = await ProductModel.find(filter)
                         .skip(skip)
                         .limit(parseInt(limit))
                         .populate("author", "email")
                         .sort({ createdAt : -1 });

        res.status(200).send({ products, totalPages, totalProducts })               
    } catch (error) {
        console.error("Error while fetching products:", error);
    res.status(500).send({ message: "Failed to fetch products" });
    }
}

//get single product

const singleProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await ProductModel.findById(productId).populate("author", "email username");

        if(!product) {
             return res.status(404).send({ message : "Product not found"});
        }

        const reviews = await ReviewModel.find({productId}).populate("userId", "username email");

        res.status(200).send({ product, reviews });
    } catch (error) {
        console.error("Error fetching the product", error);
    res.status(500).send({ message: "Failed to fetch the product" });
    }
};

//update a product

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updateProduct = await ProductModel.findByIdAndUpdate(productId,{...req.body}, {new : true});

        if (!updateProduct) {
            return res.status(404).send({ message : "Product not found"});
        }

        res.status(200).send({ message : "Product updated successfully", product : updateProduct})
    } catch (error) {
        console.error("Error while updating the product", error);
    res.status(500).send({ message: "Failed to update the product" });
    }
}

// delete product

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await ProductModel.findByIdAndDelete(productId);

        if (!deleteProduct) {
            return res.status(404).send({ message : "Product not found"})
        }

        //delete reviews related to the product

        await ReviewModel.deleteMany({ productId: productId});

        res.status(200).send({message : "Product deleted successfully"})
    } catch (error) {
        console.error("Error while deleting the product", error);
    res.status(500).send({ message: "Failed to delete the product" });
    }
}

// get related products

const relatedProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message : "Product ID is required.."});
        }
        const product = await ProductModel.findById(id);
        if (!product) {
             return res.status(404).send({ message: "Product not found"})
        }

        const titleRegex = new RegExp(
            product.name.split(" ").filter((word) => word.length > 1 ).join("|"),"i"
        );

        const relatedProducts = await ProductModel.find({
            _id : { $ne : id }, // exclude the current product
            $or: [
                { name : { $regex : titleRegex }}, // match similar names
                { category : product.category }, // match the same category
            ],
        });

        res.status(200).send(relatedProducts);
    } catch (error) {
        console.error("Error fetching the related products", error);
    res.status(500).send({ message: "Failed to fetch related products" });
    }
}


export { createProduct, getAllProducts, singleProduct, updateProduct, deleteProduct, relatedProducts};