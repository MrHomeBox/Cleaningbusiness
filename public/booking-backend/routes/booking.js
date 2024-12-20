const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();

// Route to save a booking
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body; // Form data from the client
        const newBooking = new Booking(bookingData);
        await newBooking.save();
        res.status(201).json({ message: 'Booking saved successfully!', booking: newBooking });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ message: 'Error saving booking', error });
    }
});

// Route to fetch all bookings (with optional filters via query params)
router.get('/', async (req, res) => {
    try {
        const filters = req.query; // Use query params for filtering
        const bookings = await Booking.find(filters); // Fetch matching bookings
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});

module.exports = router;
