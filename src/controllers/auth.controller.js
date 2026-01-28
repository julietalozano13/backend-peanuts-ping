import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  console.log("➡️ [SIGNUP] Request received");

  try {
    const { fullName, email, password } = req.body;
    console.log("📦 [SIGNUP] Body:", {
      fullName,
      email,
      hasPassword: !!password,
    });

    if (!fullName || !email || !password) {
      console.warn("⚠️ [SIGNUP] Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.warn("⚠️ [SIGNUP] Password too short");
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn("⚠️ [SIGNUP] Invalid email format");
      return res.status(400).json({ message: "Invalid email format" });
    }

    console.log("✅ [SIGNUP] Validations passed");

    console.log("🔍 [SIGNUP] Checking existing user");
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.warn("⚠️ [SIGNUP] Email already exists");
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log("🔐 [SIGNUP] Hashing password");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("💾 [SIGNUP] Creating user");
    const savedUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    console.log("✅ [SIGNUP] User created:", savedUser._id.toString());

    console.log("🍪 [SIGNUP] Generating JWT");
    generateToken(savedUser._id, res);


    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

    console.log("📤 [SIGNUP] Response sent");


    if (ENV.RESEND_API_KEY) {
      console.log("📧 [SIGNUP] Scheduling welcome email");

      setTimeout(() => {
        sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIENT_URL
        ).catch((err) => {
          console.error("❌ [EMAIL] Welcome email failed:", err.message);
        });
      }, 0);
    } else {
      console.warn("⚠️ [SIGNUP] RESEND_API_KEY not set, skipping email");
    }
  } catch (error) {
    console.error("❌ [SIGNUP] Fatal error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message, 
    });
  }
};


export const login = async (req, res) => {
  console.log("➡️ [LOGIN] Request received");

  try {
    const { email, password } = req.body;
    console.log("📦 [LOGIN] Body:", { email, hasPassword: !!password });

    if (!email || !password) {
      console.warn("⚠️ [LOGIN] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log("🔍 [LOGIN] Finding user");
    const user = await User.findOne({ email });

    if (!user) {
      console.warn("⚠️ [LOGIN] User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("🔐 [LOGIN] Comparing password");
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.warn("⚠️ [LOGIN] Incorrect password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("🍪 [LOGIN] Generating JWT");
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

    console.log("📤 [LOGIN] Response sent");
  } catch (error) {
    console.error("❌ [LOGIN] Fatal error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message,
    });
  }
};

export const logout = (_, res) => {
  console.log("➡️ [LOGOUT] Clearing cookie");
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  console.log("➡️ [UPDATE PROFILE] Request received");

  try {
    const { profilePic } = req.body;
    console.log("📦 [UPDATE PROFILE] Has profilePic?", !!profilePic);

    if (!profilePic) {
      console.warn("⚠️ [UPDATE PROFILE] Missing profilePic");
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const userId = req.user._id;
    console.log("☁️ [UPDATE PROFILE] Uploading to Cloudinary");

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    console.log("💾 [UPDATE PROFILE] Updating user");
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
    console.log("📤 [UPDATE PROFILE] Response sent");
  } catch (error) {
    console.error("❌ [UPDATE PROFILE] Fatal error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message,
    });
  }
};
