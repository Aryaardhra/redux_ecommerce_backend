
//user status by email
import userModel from "../models/userModel.js";
import OrderModel from "../models/orderModel.js";
import ReviewModel from "../models/reviewsModel.js";
import ProductModel from "../models/ProductModel.js";

const userStatusByEmail = async(req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).send({ message : "Email is required"});
    }

    try{
        const user = await userModel.findOne({ email : email})

        if(!user) return res.status(404).send({ message : "User not found" })

            //sum of all orders

            const totalPaymentsResult = await OrderModel.aggregate([
                { $match : { email : email }},
                { $group : {_id: null, totalAmount: {$sum : "$amount"}}}
            ])

            const totalPaymentsAmount = totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;

            //get total review

            const totalReviews = await ReviewModel.countDocuments({userId: user._id})

            // total purchased products
            const purchasedProductIds = await OrderModel.distinct("products.productId", {email: email});
            const totalPurchasedProducts =  purchasedProductIds.length;
    
            res.status(200).send({
               totalPayments: totalPaymentsAmount.toFixed(2),
               totalReviews,
               totalPurchasedProducts
            });
            
         } catch (error) {
            console.error("Error while fetching user status", error);
            res.status(500).send({ message: 'Failed to fetch user status' });
         }
            
    };

    //admin status

    const adminStatus = async (req, res) => {
        try {
            //count total orders

            const totalOrders = await OrderModel.countDocuments();

            // Count total products
            const totalProducts = await ProductModel.countDocuments();
       
            // count total reviews

            const totalReviews = await ReviewModel.countDocuments();

            //count total users

            const totalUsers = await userModel.countDocuments();

            //calculate total earnings by summing the amount of all orders

            const totalEarningsResult = await OrderModel.aggregate([
                {
                    $group : {
                        _id : null,
                        totalEarnings : { $sum : "$amount"},
                    },
                },
            ]);
        
            const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalEarnings : 0;

            //calculate monthly earnings by summing the amount of all orders grouped by month

            const monthlyEarningsResult = await OrderModel.aggregate([
                {
                    $group : {
                        _id : { month : { $month : "$createdAt"}, year : { $year : "$createdAt"}},
                        monthlyEarnings : { $sum: "$amount"}, 
                    },
                },
                {
                    $sort : { "_id.year" :1, "_id.month" : 1 } //sort by year and month
                }
            ]);

        //format the monthly earnings data for easier consumption on the frontend

        const monthlyEarnings = monthlyEarningsResult.map(entry => ({
            month : entry._id.month,
            year : entry._id.year,
            earnings : entry.monthlyEarnings,
        }));

        //send the aggregated data

        res.status(200).json({
            totalOrders,
            totalProducts,
            totalReviews,
            totalUsers,
            totalEarnings, //include total earnings
            monthlyEarnings, //include monthly earnings
        })
        } catch (error) {
            console.error("Error while fetching admin status:", error);
      res.status(500).json({ message: "Failed to fetch admin status" });
        }
    };

    export { userStatusByEmail, adminStatus };
