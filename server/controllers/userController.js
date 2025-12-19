import User from '../models/userModel.js'
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcrypt'
import validator from 'validator'
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, secretKey} = req.body;

    if (!name) return res.status(404).json({ success: false, message: "Full name requred" })
    if (!email) return res.status(404).json({ success: false, message: "Email requred" })
    if (!validator.isEmail(email)) return res.status(404).json({ success: false, message: "Invalid email address" })
    if (!password) return res.status(404).json({ success: false, message: "password requred" })
    if (password.length < 6) return res.status(404).json({ success: false, message: "The length of password must be greater than 6 digit" })
    if (!phone) return res.status(404).json({ success: false, message: "Phone is required" })
    if (phone.length < 10) return res.status(404).json({ success: false, message: "Phone lenght must be 10 digit" })
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exist",
      });
    }

    let role = "user"
    const secret = process.env.SECRET_KEY
    if(secretKey){
      if(secretKey !== secret){
       return res.status(400).json({success:false,message:"Invalid secretKey"})
      }else{
        role = "admin"
      }
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    // const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    await newUser.save();

    // await sendEmail(
    //   email,
    //   "Your OTP Verification Code",
    //   `Your OTP code is: ${otp}. It will expire in 5 minutes.`
    // );

    res.status(201).json({
      success: true,
      message: `Successfully registered as ${role}`,
      userId: newUser._id,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Problem",
    });
  }
};




// verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();


    await sendEmail(email, "Your OTP Code", `Your new OTP is ${otp}. It expires in 5 minutes.`);

    return res.json({ success: true, message: "New OTP sent to email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // if (!user.isVerified) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Your account is not verified. Please verify OTP.",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};


//CHANGE ROLE ---------> ONLY FOR ADMIN
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;


    const allowedRoles = ["user", "organizer", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL USERS ---------> ONLY FOR ADMIN
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};