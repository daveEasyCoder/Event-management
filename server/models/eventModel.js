import mongoose from 'mongoose';


// EVENT MODEL
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: {type:String,default:""},
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required:true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required:true},
    startDate: { type: Date, required: true },
    endDate: {type:Date,default:null},
    image: {type:String,default:""},
    normalPrice :{
        price: { type: Number,default:0},
        quantity:{ type: Number,default:0}
    },
    vipPrice :{
        price: { type: Number,default:0},
        quantity:{ type: Number,default:0}
    },

    totalTicketsSold:{type:Number,default:0},
    isPublished: { type: Boolean, default: false },

}, { timestamps: true });


const Event = mongoose.model('Event', EventSchema);
export default Event;