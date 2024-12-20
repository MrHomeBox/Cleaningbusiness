const mongoose = require('mongoose');

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
    appointmentDate: Date,
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
    createdAt: { type: Date, default: Date.now },

    
});

// Create Model
const Booking = mongoose.model('Booking', bookingSchema);

// Function to Save Booking
const saveBooking = async (bookingData) => {
  const booking = new Booking(bookingData);
  try {
    const result = await booking.save();
    console.log('Booking saved:', result);
    return result;
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
};

// Function to Fetch Bookings
const fetchBookings = async (filter = {}) => {
  try {
    const bookings = await Booking.find(filter);
    console.log('Fetched bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

module.exports = { saveBooking, fetchBookings };


module.exports = mongoose.model('Booking', bookingSchema);
