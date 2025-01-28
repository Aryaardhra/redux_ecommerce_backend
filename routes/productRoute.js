import express from "express";
import { createProduct, deleteProduct, getAllProducts, relatedProducts, singleProduct, updateProduct } from "../controllers/productController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const productRouter = express.Router();

productRouter.post("/create-product",verifyToken, verifyAdmin, createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", singleProduct);
productRouter.patch("/update-product/:id", verifyToken, verifyAdmin, updateProduct);
productRouter.delete("/delete/:id",verifyToken, verifyAdmin, deleteProduct);
productRouter.get("/related/:id", relatedProducts);

export default productRouter;