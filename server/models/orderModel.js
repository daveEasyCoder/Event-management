import mongoose from "mongoose";

// ORDER MODEL
const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    tickets: [
        {
            ticketType: { type: String, enum: ["normal", "vip"] },
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: Number,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;