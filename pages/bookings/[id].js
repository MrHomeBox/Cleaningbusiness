import React from "react";
import styles from "../../styles/bookingdetails.module.css";


const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const BookingDetails = ({ booking, error }) => {
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Booking Details</h1>

      <h2 className={styles.sectionTitle}>General Information</h2>
      <ul className={styles.bookingDetails}>
        <li><strong>Booking Date:</strong> {booking.appointmentDate}</li>
        <li><strong>Booking Time:</strong> {booking.appointmentTime}</li>
        <li><strong>Zip Code:</strong> {booking.zipCode}</li>
        <li><strong>Square Feet:</strong> {booking.squareFeet}</li>
        <li><strong>Bedrooms:</strong> {booking.bedrooms}</li>
        <li><strong>Living Rooms:</strong> {booking.livingRooms}</li>
        <li><strong>Bathrooms:</strong> {booking.bathrooms}</li>
        <li><strong>Cleaning Type:</strong> {booking.cleaningType}</li>
        <li><strong>Home Condition:</strong> {booking.homeCondition}</li>
        <li><strong>Pets:</strong> {booking.pets === "yes" ? "Yes" : "No"}</li>
        <li><strong>Frequency:</strong> {booking.frequency}</li>
      </ul>

      <h2 className={styles.sectionTitle}>Add-On Services</h2>
      <ul className={styles.bookingDetails}>
        {booking.addOnServices?.length > 0 ? (
          booking.addOnServices.map((service, index) => <li key={index}>- {service}</li>)
        ) : (
          <li>No add-on services selected.</li>
        )}
      </ul>

      <h2 className={styles.sectionTitle}>Contact Information</h2>
      <ul className={styles.bookingDetails}>
        <li><strong>Email:</strong> {booking.contactInfo.email}</li>
        <li><strong>Phone:</strong> {booking.contactInfo.phone}</li>
      </ul>

      <h2 className={styles.sectionTitle}>Address</h2>
      <ul className={styles.bookingDetails}>
        <li><strong>Street:</strong> {booking.address.street}</li>
        <li><strong>City:</strong> {booking.address.city}</li>
        <li><strong>State:</strong> {booking.address.state}</li>
        <li><strong>Zip Code:</strong> {booking.address.zip}</li>
      </ul>

      <h2 className={styles.sectionTitle}>Pricing</h2>
      <ul className={styles.bookingDetails}>
        <li><strong>Total Price:</strong> <span className={styles.highlight}>${booking.totalPrice.toFixed(2)}</span></li>
        <li><strong>Payment Type:</strong> {booking.paymentType}</li>
      </ul>

      <a href="/" className={styles.btn}>Back to Home</a>
      <a href="tel:(469) 953-7291" className={styles.btn}>Contact Us</a>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    // const res = await fetch(`http://essentialscleaner.com/api/bookings/${id}`); 
    const res = await fetch(`${WEB_URL}/api/bookings/${id}`); 
    if (!res.ok) {
      throw new Error(`Failed to fetch booking: ${res.statusText}`);
    }
    const booking = await res.json();
    return { props: { booking } };
  } catch (err) {
    return {
      props: {
        error: err.message || "Failed to fetch booking details",
      },
    };
  }
}

export default BookingDetails;
