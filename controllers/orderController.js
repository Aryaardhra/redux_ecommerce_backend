import dotenv from "dotenv";
import Stripe from "stripe";
import OrderModel from "../models/orderModel.js";

// Load environment variables
dotenv.config();

// Check if the Stripe secret key is present
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in the environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const checkout = async (req, res) => {
  const { products } = req.body;

  try {
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "INR",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

const confirmPayment = async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });

    const paymentIntentId = session.payment_intent.id;

    let order = await OrderModel.findOne({ orderId: paymentIntentId });

    if (!order) {
      const lineItems = session.line_items.data.map((item) => ({
        productId: item.price.product,
        quantity: item.quantity,
      }));

      const amount = session.amount_total / 100;

      order = new OrderModel({
        orderId: paymentIntentId,
        products: lineItems,
        amount: amount,
        email: session.customer_details.email,
        status: session.payment_intent.status === "succeeded" ? "pending" : "failed",
      });
    } else {
      order.status = session.payment_intent.status === "succeeded" ? "pending" : "failed";
    }

    await order.save();

    res.json({ order });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
};

const orderByEmail = async (req, res) => {
  const email = req.params.email;
  if(!email) {
    return res.status(400).send({ message : "Email is required"});
  }

  try {
    const orders = await OrderModel.find({ email : email});
    if(orders.length === 0 || !orders) {
      return res.status(400).send({ orders : 0, message: "No order found for this email"})
    }
    res.status(200).send({ orders });
  } catch (error) {
    console.error("Error while fetching orders by email", error);
    res.status(500).send({ message: "Failed to fetch orders by email" });
  }
}

// get order by id

const orderById = async(req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if(!order) {
      return res.status(404).send({ message : "Order not found"})
    }
    res.status(200).send(order);
  } catch (error) {
    console.error("Error while fetching orders by user id", error);
    res.status(500).send({ message: "Failed to fetch orders by user id" });
  }
};

const getAllOrders = async(req, res) => {
  try {
    const orders = await OrderModel.find().sort({createdAt : -1});

    if(orders.length === 0) {
      return res.status(404).send({ message: "No orders found", orders: [] })
    }
    res.status(200).send(orders)
  } catch (error) {
    console.error("Error fetching all orders", error);
    res.status(500).send({ message: "Failed to fetch all orders" });
  }
};

//update order status

const updateOrderStatus = async (req, res) => {
  const {id} = req.params;
  const { status } =req.body;

  if(!status) {
    return res.status(400).send({ message : "Status is required"});
  }

  try {
    const updateOrder = await OrderModel.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt : new Date(),
      },
      {
        new : true,
        runValidators : true,
      }
    );

    if(!updateOrder) {
      return res.status(404).send({ message : "Order not found"})
    }
    res.status(200).json({
      message : "Order status updated successfully",
      order : updateOrder
    })
  } catch (error) {
    console.error("Error while updating order status", error);
    res.status(500).send({ message: "Failed to update order status" });
  }
};

//delete order

const deleteOrder = async(req, res) => {
  const {id} = req.params;
  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(id);
    if(!deleteOrder){
      return res.status(404).send({ message : "Order not found"});
    }
    res.status(200).json({ message : "Order deleted successfully", order :deletedOrder})
  } catch (error) {
    console.error("Error while deleting order", error);
    res.status(500).send({ message: "Failed to delete order" });
  }
}

export { checkout, confirmPayment, orderByEmail, orderById, getAllOrders, updateOrderStatus, deleteOrder};
