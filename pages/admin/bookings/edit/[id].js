import React, { useState, useEffect } from "react";
import styles from "../../../../styles/bookingdetails.module.css";
import { useRouter } from "next/router";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const EditBooking = ({ booking, error }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    appointmentDate: booking?.appointmentDate || "",
    appointmentTime: booking?.appointmentTime || "",
    zipCode: booking?.zipCode || "",
    squareFeet: booking?.squareFeet || "",
    bedrooms: booking?.bedrooms || "",
    livingRooms: booking?.livingRooms || "",
    bathrooms: booking?.bathrooms || "",
    cleaningType: booking?.cleaningType || "",
    homeCondition: booking?.homeCondition || "",
    pets: booking?.pets || "no",
    frequency: booking?.frequency || "",
    addOnServices: booking?.addOnServices?.join(", ") || "",
    contactInfo: {
      email: booking?.contactInfo?.email || "",
      phone: booking?.contactInfo?.phone || "",
    },
    address: {
      street: booking?.address?.street || "",
      city: booking?.address?.city || "",
      state: booking?.address?.state || "",
      zip: booking?.address?.zip || "",
    },
    totalPrice: booking?.totalPrice || 0,
    paymentType: booking?.paymentType || "",
    cleaner: booking?.cleaner || "",
  });

  const [showModal, setShowModal] = useState(false); 
  const [cleanerName, setCleanerName] = useState(""); 
  const [cleanerNumber, setCleanerNumber] = useState("");
  const [adminCode, setAdminCode] = useState(""); 
  const [assigning, setAssigning] = useState(false); 
  const [message, setMessage] = useState(""); 
  const [cleaners, setCleaners] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState(booking?.cleaner || "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contactInfo.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [key]: value,
        },
      }));
    } else if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  const fetchCleaners = async () => {
    try {
      // const res = await fetch("http://essentialscleaner.com/api/cleaners", {
      const res = await fetch(`${WEB_URL}/api/cleaners`, {
        headers: { "Admin-Code": adminCode },
      });
      if (!res.ok) throw new Error("Failed to fetch cleaners");

      const data = await res.json();
      setCleaners(data);
    } catch (err) {
      alert(err.message || "An error occurred");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await fetch(`http://essentialscleaner.com/api/bookings/${booking._id}`, {
      const res = await fetch(`${WEB_URL}/api/bookings/${booking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/admin/bookings/${booking._id}`);
      } else {
        alert("Failed to update booking.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleAssignCleaner = async () => {
    if (!selectedCleaner) {
      setMessage("Please select a cleaner.");
      return;
    }
  
    if (!adminCode) {
      setMessage("Admin code is required.");
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
          cleanerId: selectedCleaner,
          adminCode,
        }),
      });
  
      if (!res.ok) {
        throw new Error(`Failed to assign cleaner: ${res.statusText}`);
      }
  
      const data = await res.json();
      
      setMessage(`Cleaner ${data.cleaner.name} assigned successfully!`);
      setShowModal(false);
      setSelectedCleaner("");
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
      <h1 className={styles.h1}>Edit Booking</h1>
      <form onSubmit={handleSubmit}>
        <h2 className={styles.sectionTitle}>General Information</h2>
        <div className={styles.formGroup}>
          <label>Booking Date</label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Booking Time</label>
          <select
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="10am">10 AM</option>
            <option value="2pm">2 PM</option>
            <option value="5pm">5 PM</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Zip Code</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Square Feet</label>
          <input
            type="number"
            name="squareFeet"
            value={formData.squareFeet}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Living Rooms</label>
          <input
            type="number"
            name="livingRooms"
            value={formData.livingRooms}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Cleaning Type</label>
          <input
            type="text"
            name="cleaningType"
            value={formData.cleaningType}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Home Condition</label>
          <input
            type="text"
            name="homeCondition"
            value={formData.homeCondition}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Pets</label>
          <select
            name="pets"
            value={formData.pets}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Frequency</label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="One-time">One-time</option>
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <h2 className={styles.sectionTitle}>Contact Information</h2>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone</label>
          <input
            type="tel"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <h2 className={styles.sectionTitle}>Address</h2>
        <div className={styles.formGroup}>
          <label>Street</label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>City</label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>State</label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Zip Code</label>
          <input
            type="text"
            name="address.zip"
            value={formData.address.zip}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        
        {/* Pricing */}
      <h2 className={styles.sectionTitle}>Pricing</h2>
      <ul className={styles.bookingDetails}>
        <li><strong>Total Price:</strong> <span className={styles.highlight}>${booking.totalPrice.toFixed(2)}</span></li>
        <li><strong>Payment Type:</strong> {booking.paymentType}</li>
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
        
      <button className={styles.fullbtn} type="button" onClick={() => setShowModal(true)}>
          Assign Cleaner
      </button>

        <button type="submit" className={styles.fullbtn}>Save Changes</button>


      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Assign Cleaner</h2>
        
            <select
                id="cleaner"
                value={selectedCleaner}
                onChange={(e) => setSelectedCleaner(e.target.value)}
                className={styles.input}
              >
                <option value="">Select a cleaner</option>
                {cleaners.map((cleaner) => (
                  <option key={cleaner._id} value={cleaner._id}>
                    {cleaner.name} - {cleaner.contactInfo.phone}
                  </option>
                ))}
              </select>
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

      </form>
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

export default EditBooking;
