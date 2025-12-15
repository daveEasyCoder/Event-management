import mongoose from "mongoose";

// VENUE MODEL WHERE EVENT TAKE PLACE
const VenueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, default: "" },
    address: String,
    city: String,
    country: String,
    capacity: Number,
}, { timestamps: true });


const Venue = mongoose.model('Venue', VenueSchema);
export default Venue;