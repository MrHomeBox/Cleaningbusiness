import React, { useState } from "react";
import styles from "../../styles/dashboard.module.css";
import Link from "next/link";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const Dashboard = () => {
  const [adminCode, setAdminCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminCodeSubmit = async (e) => {
    e.preventDefault();

    try {
      // const res = await fetch("http://essentialscleaner.com/api/validate-admin", {
      const res = await fetch(`/api/validate-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthorized(true);
        setError("");
        fetchBookings();
      } else {
        throw new Error(data.message || "Invalid admin code");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // const res = await fetch("http://essentialscleaner.com/api/admin/bookings", {
      const res = await fetch(`/api/admin/bookings`, {
        headers: {
          "Content-Type": "application/json",
          "Admin-Code": adminCode,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`${WEB_URL}/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Admin-Code": adminCode,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }
      setBookings(bookings.filter((booking) => booking._id !== id));
      alert("Booking deleted successfully!");
    } catch (err) {
      alert("Failed to delete booking: " + err.message);
    }
  };

  if (!isAuthorized) {
    return (
      <div className={styles.authContainer}>
        <form onSubmit={handleAdminCodeSubmit} className={styles.authForm}>
          <h1>Admin Dashboard Login</h1>
          <label htmlFor="adminCode">Enter Admin Code:</label>
          <input
            type="password"
            id="adminCode"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className={styles.authInput}
            required
          />
          <button type="submit" className={styles.authButton}>
            Submit
          </button>
          {error && <p className={styles.authError}>{error}</p>}
        </form>
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    (<div className={styles.container}>
      <h1 className={styles.title}>Bookings Dashboard</h1>
      <div className={styles.actions}>
        <Link href="/admin/cleaners">
          <button className={styles.btn}>Manage Cleaners</button>
        </Link>
      </div>
      {bookings.length === 0 ? (
        <p>No bookings available</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Booking Date</th>
              <th>Customer Email</th>
              <th>Customer Phone</th>
              <th>Address</th>
              <th>Cleaner Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.appointmentDate + " @" + booking.appointmentTime}</td>
                <td>{booking.contactInfo.email}</td>
                <td>{booking.contactInfo.phone ?? ""}</td>
                <td>{booking.address.street ?? ""}</td>
                <td>{booking.assignedCleaner ?? ""}</td>
                <td className={styles.actions}>
                  <Link href={`${WEB_URL}/admin/bookings/${booking._id}`} className={styles.viewBtn}>
                    View
                  </Link>
                  <Link href={`${WEB_URL}/admin/bookings/edit/${booking._id}`} className={styles.editBtn}>
                    Edit
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(booking._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>)
  );
};

export default Dashboard;
