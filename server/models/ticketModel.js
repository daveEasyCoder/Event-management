import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ticketType: { type: String, enum: ["normal", "vip"], required: true },
    price: { type: Number, required: true },
    qrCode: String,
    isUsed: { type: Boolean, default: false },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket
