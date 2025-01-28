import express from "express"
import {checkout, confirmPayment, deleteOrder, getAllOrders, orderByEmail, orderById, updateOrderStatus } from "../controllers/orderController.js"
const orderRouter = express.Router();

orderRouter.post("/create-checkout-session", checkout);
orderRouter.post("/confirm-payment", confirmPayment);
orderRouter.get("/:email", orderByEmail);
orderRouter.get("/order/:id", orderById);
orderRouter.get("/", getAllOrders);
orderRouter.patch("/update-order-status/:id", updateOrderStatus);
orderRouter.delete("/delete-order/:id", deleteOrder);

export default orderRouter;