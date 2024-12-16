import React, { useState } from "react";
import styles from "../../../styles/bookingdetails.module.css";

const WEB_URL = process.env.VERCEL_BRANCH_URL;
const BookingDetails = ({ booking, error }) => {

  const [showModal, setShowModal] = useState(false); 
  const [cleanerName, setCleanerName] = useState(""); 
  const [cleanerNumber, setCleanerNumber] = useState("");
  const [adminCode, setAdminCode] = useState(""); 
  const [assigning, setAssigning] = useState(false); 
  const [message, setMessage] = useState(""); 

  const handleAssignCleaner = async () => {
    if (!cleanerName) {
      setMessage("Cleaner name cannot be empty.");
      return;
    }

    if (!cleanerNumber || !adminCode) {
      setSubmissionMessage("Please provide both the cleaner number and admin code.");
      return;
    }

    try {
      setAssigning(true);
      // const res = await fetch(`http://essentialscleaner.com/api/bookings/${booking._id}/assign-cleaner`, {
      const res = await fetch(`/api/bookings/${booking._id}/assign-cleaner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          cleanerName, 
          cleanerNumber,
          adminCode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to assign cleaner: ${res.statusText}`);
      }

      const data = await res.json();
      setMessage(`Cleaner ${data.cleanerName} assigned successfully!`);
      setCleanerName(""); 
      setCleanerNumber(""); 
      setAdminCode(""); 
      setShowModal(false); 
    } catch (err) {
      setMessage(err.message || "Failed to assign cleaner.");
    } finally {
      setAssigning(false);
    }
  };

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

      <h2 className={styles.sectionTitle}>Pricing</h2>
      <ul className={styles.bookingDetails}>
        <li><strong>Total Price:</strong> <span className={styles.highlight}>${booking.totalPrice.toFixed(2)}</span></li>
        <li><strong>Payment Type:</strong> {booking.paymentType}</li>
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

      {booking.assignedCleaner && (
        <>
          <h2 className={styles.sectionTitle}>Cleaner Information</h2>
          <ul className={styles.bookingDetails}>
            <li><strong>Assigned Cleaner:</strong> {booking.assignedCleaner}</li>
          </ul>
          <ul className={styles.bookingDetails}>
            <li><strong>Cleaner Phone:</strong> {booking.assignedCleanerNumber}</li>
          </ul>
        </>
      )}

      <button className={styles.fullbtn} onClick={() => setShowModal(true)}>
          Assign Cleaner
      </button>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Assign Cleaner</h2>
            <input
              type="text"
              placeholder="Enter cleaner name"
              value={cleanerName}
              onChange={(e) => setCleanerName(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Enter cleaner number"
              value={cleanerNumber}
              onChange={(e) => setCleanerNumber(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Admin Code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <button
                onClick={handleAssignCleaner}
                className={styles.btn}
                disabled={assigning}
              >
                {assigning ? "Assigning..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      )}

      {/* <a href={`http://localhost:3000/admin/bookings/edit/${booking._id}`} className={styles.btn}>Edit Booking</a> */}
      <a href={`${WEB_URL}/admin/bookings/edit/${booking._id}`} className={styles.btn}>Edit Booking</a>
      <a href="/" className={styles.btn}>Back to Home</a>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    // const res = await fetch(`http://localhost:5000/api/bookings/${id}`); 
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
