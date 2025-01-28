import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import orderRouter from "./routes/orderRoute.js";
import statusRouter from "./routes/statusRoute.js";
import cloudinaryImg from "./utils/uploadImage.js";

dotenv.config();
//app config

const app = express();
const PORT = process.env.PORT || 5002
connectDB();

//middlewares

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

//api endpoints

app.use("/api/auth", userRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/orders", orderRouter);
app.use("/api/status", statusRouter);

app.post("/uploadImage", (req, res) => {
    cloudinaryImg(req.body.image)
      .then((url) => res.send(url))
      .catch((err) => res.status(500).send(err));
  });

app.get("/", (req,res) => {
    res.send("API working")
})

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
});