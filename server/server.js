import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import venueRoutes from './routes/venueRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true                 
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/categories', categoryRoutes);

app.use("/uploads", express.static("uploads"));

// Database connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.listen(PORT,() => {
    console.log("server running on port: ", PORT);
})


