import mongoose from "mongoose";

// USER MODEL
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
    phone: {type:String,default:""},
    profilePic: {type:String, default:""},

    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false, },

}, { timestamps: true });


const User = mongoose.model('User', UserSchema);
export default User