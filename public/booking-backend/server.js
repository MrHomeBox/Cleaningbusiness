const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Booking Schema and Model
const bookingSchema = new mongoose.Schema({
  zipCode: String,
  squareFeet: Number,
  bedrooms: String,
  livingRooms: String,
  bathrooms: String,
  cleaningType: String,
  homeCondition: String,
  pets: String,
  frequency: String,
  addOnServices: [String],
  appointmentDate: String,
  appointmentTime: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  contactInfo: {
    phone: String,
    email: String,
  },
  paymentType: String,
  totalPrice: Number,
});

const Booking = mongoose.model("Booking", bookingSchema);

// API Route to save bookings
app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json({ message: "Booking saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save booking", details: err });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
