const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { sendEmail, sendSMS } = require('./notificationService');

const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_CODE = process.env.ADMIN_CODE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
  assignedCleaner: String,
  assignedCleanerNumber: String,
  cleaner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cleaner', 
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

// API Route to save bookings
app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();

    const { email, phone } = req.body.contactInfo;
    const { appointmentDate, appointmentTime, address } = req.body;

    const bookingLink = `http://localhost:5000/bookings/${savedBooking._id}`;
    const adminBookingLink = `http://localhost:5000/admin/bookings/${savedBooking._id}`;
    const adminDashboard = `http://localhost:5000/admin/booking`;
    const emailContent = `
      <h1>Booking Confirmation</h1>
      <p>Hi ${email},</p>
      <p>Your booking has been confirmed!</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
      <p>You can view the details of your booking by clicking the link below:</p>
      <p><a href="${bookingLink}" target="_blank">View Booking Details</a></p>
      <p>Thank you for choosing our service!</p>
    `;
    const adminEmailContent = `
      <h1>Booking Confirmation</h1>
      <p>Booking has been confirmed!</p>
      <p>For: ${email}, ${phone}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
      <p>You can view the details of your booking by clicking the link below:</p>
      <p><a href="${adminBookingLink}" target="_blank">View Booking Details</a></p>
      <p><a href="${adminDashboard}" target="_blank">View All Bookings</a></p>
      <p>Thank you for choosing our service!</p>
    `;

    const smsMessageBody = `
      Hi ${phone}, 
      Your booking is confirmed!
      Date: ${appointmentDate}
      Time: ${appointmentTime}
      Address: ${address.street}, ${address.city}, ${address.state}
    `;

    // Send notifications
    await sendEmail(email, "Booking Confirmation", emailContent, []);
    await sendEmail(ADMIN_EMAIL, "Admin Booking Confirmation", adminEmailContent,[]);
    await sendSMS(phone, smsMessageBody);

    res.status(201).json({ message: "Booking saved and notifications sent!", booking: savedBooking });
  } catch (err) {
    console.error("Error handling booking:", err);
    res.status(500).json({ error: "Failed to process booking", details: err.message });
  }
});

app.put("/api/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id; 
    const updatedData = req.body; 

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updatedData,
      { new: true } 
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const { email, phone } = updatedData.contactInfo;
    const { appointmentDate, appointmentTime, address } = updatedData;

    const bookingLink = `http://localhost:5000/bookings/${updatedBooking._id}`;
    const emailContent = `
      <h1>Booking Update</h1>
      <p>Hi ${email},</p>
      <p>Your booking has been updated!</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
      <p>You can view the details of your booking by clicking the link below:</p>
      <p><a href="${bookingLink}" target="_blank">View Booking Details</a></p>
      <p>Thank you for choosing our service!</p>
    `;

    const smsMessageBody = `
      Hi ${phone}, 
      Your booking has been updated!
      Date: ${appointmentDate}
      Time: ${appointmentTime}
      Address: ${address.street}, ${address.city}, ${address.state}
    `;

    // Send notifications
    await sendEmail(email, "Booking Update", emailContent, ["tmsibanda@africau.edu"]);
    await sendSMS(phone, smsMessageBody);

    res.status(200).json({ message: "Booking updated and notifications sent!", booking: updatedBooking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: "Failed to update booking", details: err.message });
  }
});

app.get("/api/bookings/:id", async (req, res) => {
  console.log("getting: " + req.params.id);
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking details", details: err });
  }
});

app.post('/api/bookings/:id/assign-cleaner', async (req, res) => {
  const { id } = req.params;
  const { cleanerId, adminCode } = req.body;

  console.log("Cleaner: " + cleanerId);

  if (adminCode !== ADMIN_CODE) {
    return res.status(403).json({ message: "Invalid admin code. Authorization failed." });
  }

   const cleaner = await Cleaner.findById(cleanerId);
   if (!cleaner) {
     return res.status(404).json({ message: "Cleaner not found" });
   }

   console.log(cleaner);
   const assignedCleaner = cleaner.name;
    const assignedCleanerNumber = cleaner.contactInfo.phone;

   cleaner.currentBookings.push(id);
   await cleaner.save();

  try {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { cleaner:cleanerId, assignedCleaner: assignedCleaner , assignedCleanerNumber: assignedCleanerNumber },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Cleaner assigned successfully.", cleaner: {name: assignedCleaner, phone: assignedCleanerNumber}});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Failed to assign cleaner.", error });
  }
});

app.post("/api/validate-admin", (req, res) => {
  const { adminCode } = req.body;

  if (adminCode === ADMIN_CODE) {
    res.status(200).json({ message: "Admin code validated successfully" });
  } else {
    res.status(401).json({ message: "Invalid admin code" });
  }
});

app.use("/api/admin/bookings", (req, res, next) => {
  const adminCode = req.headers["admin-code"];

  if (adminCode === ADMIN_CODE) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Invalid admin code" });
  }
});

app.get("/api/admin/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
});

app.delete("/api/admin/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      res.status(404).json({ message: "Booking not found" });
    } else {
      res.status(200).json({ message: "Booking deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking", error: err.message });
  }
});

// Cleaners
const cleanerSchema = new mongoose.Schema({
  name: String,
  contactInfo: {
    phone: String,
    email: String,
  },
  availability: String,
  currentBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking', 
  }],
});

const Cleaner = mongoose.model("Cleaner", cleanerSchema);

app.get("/api/cleaners", async (req, res) => {
  try {
    const cleaners = await Cleaner.find();
    res.status(200).json(cleaners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cleaners", error: err.message });
  }
});

app.post("/api/cleaners", async (req, res) => {
  try {
    const newCleaner = new Cleaner(req.body);
    const savedCleaner = await newCleaner.save();
    res.status(201).json(savedCleaner);
  } catch (err) {
    res.status(500).json({ message: "Failed to add cleaner", error: err.message });
  }
});

app.put("/api/cleaners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCleaner = await Cleaner.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedCleaner) {
      return res.status(404).json({ message: "Cleaner not found" });
    }
    res.status(200).json(updatedCleaner);
  } catch (err) {
    res.status(500).json({ message: "Failed to update cleaner", error: err.message });
  }
});

app.delete("/api/cleaners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCleaner = await Cleaner.findByIdAndDelete(id);
    if (!deletedCleaner) {
      return res.status(404).json({ message: "Cleaner not found" });
    }
    res.status(200).json({ message: "Cleaner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete cleaner", error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
