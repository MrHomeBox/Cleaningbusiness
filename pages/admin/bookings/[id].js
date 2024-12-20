import React, { useState, useRef } from "react";
import styles from "../../../styles/bookingdetails.module.css";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const BookingDetails = ({ booking, error }) => {


  const [showModal, setShowModal] = useState(false); 
  const [cleanerName, setCleanerName] = useState(""); 
  const [cleanerNumber, setCleanerNumber] = useState("");
  const [adminCode, setAdminCode] = useState(""); 
  const [assigning, setAssigning] = useState(false); 
  const [message, setMessage] = useState(""); 
  const bookingRef = useRef(null);

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
      const res = await fetch(`${WEB_URL}/api/bookings/${booking._id}/assign-cleaner`, {
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

  const handleDownloadPDF = async () => {
    if (bookingRef.current) {
      const buttonsContainer = document.querySelector("#buttonsContainer");

      // Temporarily hide the buttonsContainer
      if (buttonsContainer) {
        buttonsContainer.style.display = "none";
      }

      const element = bookingRef.current;

      // Convert HTML to a canvas
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4"); // Portrait orientation, mm units, A4 size
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

      let heightLeft = imgHeight; // Track remaining height to render
      let position = 0; // Start position for the first page

      // Add pages if content overflows
      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        if (heightLeft > 0) {
          position -= pdfHeight; // Move to the next page
          pdf.addPage();
        }
      }

      if (buttonsContainer) {
        buttonsContainer.style.display = "block";
      }

      // Save the generated PDF
      pdf.save(`Booking_${booking._id}.pdf`);
    } else {
      console.error("Reference to bookingRef is not set.");
    }
  };

  return (
    <div className={styles.container} ref={bookingRef}>
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

      {/* <button className={styles.fullbtn} onClick={() => setShowModal(true)}>
          Assign Cleaner
      </button> */}

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

      <div id="buttonsContainer">
        <a href={`${WEB_URL}/admin/bookings/edit/${booking._id}`} className={styles.btn}>Edit Booking</a>
        <button onClick={handleDownloadPDF} className={styles.fullbtn}>
          Download Booking Details
        </button>
        <a href="/admin/dashboard" className={styles.btn}>Back to Home</a>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
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
