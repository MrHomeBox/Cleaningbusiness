import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { sendEmail, sendSMS } from "./notificationService.js";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;

const ADMIN_CODE = process.env.ADMIN_CODE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_WEB_URL;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

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
  bookingStatus: String,
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
    console.log(req.body.bookingStatus);

    const bookingLink = `${APP_URL}/api/bookings/${savedBooking._id}`;
    const adminBookingLink = `${APP_URL}/api/admin/bookings/${savedBooking._id}`;
    const adminDashboard = `${APP_URL}/api/admin/dashboard`;
    
    const emailContent = `
      <h1>Booking Scheduled</h1>
      <p>Hi ${email},</p>
      <p>Thank you for scheduling a cleaning with Essentials Cleaners!</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
      <p>We’ll notify you once a cleaner is assigned to your booking.</p>
      <p>You can view the details of your booking by clicking the link below:</p>
      <p><a href="${bookingLink}" target="_blank">View Booking Details</a></p>
      <p>Thank you for choosing Essentials Cleaners!</p>
    `;
    const adminEmailContent = `
      <h1>New Booking Scheduled</h1>
      <p>Booking has been Scheduled!</p>
      <p>For: ${email}, ${phone}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
      <p>You can view the details of your booking by clicking the link below:</p>
      <p><a href="${adminBookingLink}" target="_blank">View Booking Details</a></p>
      <p><a href="${adminDashboard}" target="_blank">View All Bookings</a></p>
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

    if (updatedData.cleaner == "") {
      // Cleaner is Empty Setting Null
      updatedData.cleaner = null;
    }

    const oldBooking = await Booking.findById(
      bookingId,
    );

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

    const bookingLink = `${APP_URL}/api/bookings/${updatedBooking._id}`;
    var subject = "Booking Update";
    var emailContent = `
      <h1>Booking Update</h1>
      <p>Hi ${email},</p>
      <p>Your booking details have been updated!</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
      <p>You can view the details of your booking by clicking the link below:</p>
      <p><a href="${bookingLink}" target="_blank">View Booking Details</a></p>
      <p>Thank you for using Essentials Cleaners!</p>
    `;

    if (oldBooking.bookingStatus != updatedBooking.bookingStatus) {
      switch (updatedBooking.bookingStatus) {
        case 'Confirmed':
          console.log(updatedBooking.bookingStatus);
          emailContent = `
          <h1>Your Booking is Confirmed</h1>
          <p>Hi ${email},</p>
          <p>Your booking is confirmed, and here are the details!</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
          <p><strong>Cleaner Assigned:</strong></p>
          <p><strong>Name:</strong> ${ updatedBooking.assignedCleaner }</p>
          <p>You can view the details of your booking by clicking the link below:</p>
          <p><a href="${bookingLink}" target="_blank">View Booking Details</a></p>
          <p>Thank you for using Essentials Cleaners! We look forward to serving you again.</p>
          `;
          break;
        case 'Cancelled':
            
          console.log(updatedBooking.bookingStatus);
          subject = "Job Cancellation Notice";
          emailContent = `
          <h1>Your Booking is Cancelled</h1>
          <p>Hi ${email},</p>
          <p>We regret to inform you that the following job has been canceled.</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Address:</strong> ${address.street}, ${address.city}, ${address.state}</p>
          <p>If you have any questions, feel free to contact us at essentialsgroupzw@gmail.com or call +1 (469) 953-7291.</p>
          <p>Thank You,</p>
          <p>Essentials Cleaners</p>
          `;
          
            break;
          case 'Completed':
          console.log(updatedBooking.bookingStatus);
          subject = "Thank you for choosing Essentials Cleaners!";
          emailContent = `
          <p>Hi ${email},</p>
          <p>Thank you for letting us serve you! We hope you’re delighted with your cleaning service.</p>
          <p>Your feedback helps us improve. Please share your thoughts by contacting us on email essentialsgroupzw@gmail.com or call +1 (469) 953-7291.</p>
          <p>We look forward to serving you again.</p>
          <p>Thank You,</p>
          <p>Essentials Cleaners</p>
        `;
        
        break;
      
        default:
          break;
      }
    }

    const smsMessageBody = `
      Hi ${phone}, 
      Your booking has been updated!
      Date: ${appointmentDate}
      Time: ${appointmentTime}
      Address: ${address.street}, ${address.city}, ${address.state}
    `;

    // Send notifications
    await sendEmail(email, subject, emailContent, ["tmsibanda@africau.edu"]);
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

   const assignedCleaner = cleaner.name;
    const assignedCleanerNumber = cleaner.contactInfo.phone;
    const assignedCleanerEmail = cleaner.contactInfo.email;

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

    const bookingLink = `${APP_URL}/bookings/${booking._id}`;

    const cleanerEmailBody = `
    <h2>Hi ${assignedCleaner}</h2>
    <p>You have been assigned a new cleaning job!</p>
    <p>Here are the details:</p>
    <p><strong>Date:</strong> ${booking.appointmentDate}</p>
    <p><strong>Time:</strong> ${booking.appointmentTime}</p>
    <p><strong>Address:</strong> ${booking.address.street}, ${booking.address.city}</p>
    <a href="${bookingLink}" target="_blank">View Booking Details</a>
    <p>Thank you for being part of Essentials Cleaners!</p>
    `;

    const customerEmailBody = `
    <h2>Hi ${booking.contactInfo.email}</h2>
    <p>Your booking is confirmed, and here are the details</p>
    <p>Here are the details:</p>
    <p><strong>Date:</strong> ${booking.appointmentDate}</p>
    <p><strong>Time:</strong> ${booking.appointmentTime}</p>
    <p><strong>Address:</strong> ${booking.address.street}, ${booking.address.city}</p>
    <p><strong>Cleaner Assigned:</strong></p>
    <p><strong>Name:</strong> ${ assignedCleaner }</p>
    <p>You can view the details of your booking by clicking the link below:</p>
    <a href="${bookingLink}" target="_blank">View Booking Details</a>
    <p>Thank you for choosing Essentials Cleaners! We look forward to serving you.</p>
    `;

    await sendEmail(assignedCleanerEmail,"New Booking Assigned", cleanerEmailBody);
    await sendEmail(booking.contactInfo.email,"New Booking Assigned", customerEmailBody);

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
  nationalId: String,
  address: String,
  contactInfo: {
    phone: String,
    email: String,
  },
  availability: [{
    type: String,
    enum: ["Full Time", "Morning", "Afternoon", "Evening"],  // Limit to these options
  }],
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

    let emailBody = `
      Hi ${newCleaner.name}, 
      Welcome to the Team!
    `;

    sendEmail(newCleaner.contactInfo.email,"Welcome To The Team", emailBody,[]);

    // Send Welcome Email for Cleaner 
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


export default app;