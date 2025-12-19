import mongoose from "mongoose";

// ORDER MODEL
const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
    ticketType: { type: String, enum: ["normal", "vip"] },
    price: Number,
    quantity: Number,
    totalAmount: Number,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderNumber: { type: String, default: "" },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;