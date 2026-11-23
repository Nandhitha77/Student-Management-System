
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

const otpStore = new Map();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Check Gmail connection
transporter.verify((error, success) => {
    if (error) { 
        console.log("Gmail connection failed:", error);
    } else {
        console.log("Gmail server is ready!");
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Student Management Backend is running!");
});

// 1. Send OTP
app.post("/api/auth/send-otp", async (req, res) => {

    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
        return res.status(400).json({
            message: "Email is required."
        });
    }

    const otp = crypto.randomInt(100000, 1000000);

    console.log("Received email:", email);

    try {

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Student Management System - OTP Verification",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`
        });

        // Store OTP with 5-minute expiry
        otpStore.set(email, {
            otp: String(otp),
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        console.log("OTP email sent successfully!");

        res.json({
            message: "OTP sent successfully!"
        });

    } catch (error) {

        console.log("Email error:", error);

        res.status(500).json({
            message: "Failed to send OTP email."
        });

    }
});

// 2. Verify OTP
app.post("/api/auth/verify-otp", (req, res) => {

    const email = req.body.email?.trim().toLowerCase();
    const enteredOtp = req.body.otp;

    const storedData = otpStore.get(email);

    if (!storedData) {
        return res.status(400).json({
            message: "OTP not found. Please request a new OTP."
        });
    }

    if (Date.now() > storedData.expiresAt) {

        otpStore.delete(email);

        return res.status(400).json({
            message: "OTP expired. Please request a new OTP."
        });
    }

    if (enteredOtp !== storedData.otp) {
        return res.status(400).json({
            message: "Invalid OTP. Please try again."
        });
    }

    // Delete OTP after successful verification
    otpStore.delete(email);

    res.json({
        message: "Email verified successfully!"
    });

});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
