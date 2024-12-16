import React, { useState, useEffect } from "react";
import styles from "../../styles/dashboard.module.css";

const Cleaners = () => {
  const [adminCode, setAdminCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [cleaners, setCleaners] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", contactInfo: {email: "", phone: "" }, availability: ""});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthorized) fetchCleaners();
  }, [isAuthorized]);

  const handleAdminCodeSubmit = async (e) => {
    e.preventDefault();

    try {
      // const res = await fetch("http://essentialscleaner.com/api/validate-admin", {
      const res = await fetch("/api/validate-admin", {
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
      } else {
        throw new Error(data.message || "Invalid admin code");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  const fetchCleaners = async () => {
    try {
      // const res = await fetch("http://essentialscleaner.com/api/cleaners", {
      const res = await fetch("/api/cleaners", {
        headers: { "Admin-Code": adminCode },
      });
      if (!res.ok) throw new Error("Failed to fetch cleaners");

      const data = await res.json();
      setCleaners(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this cleaner?")) return;

    try {
      // const res = await fetch(`http://essentialscleaner.com/api/cleaners/${id}`, {
      const res = await fetch(`/api/cleaners/${id}`, {
        method: "DELETE",
        headers: { "Admin-Code": adminCode },
      });
      if (!res.ok) throw new Error("Failed to delete cleaner");

      setCleaners(cleaners.filter((cleaner) => cleaner._id !== id));
      alert("Cleaner deleted successfully!");
    } catch (err) {
      alert(err.message || "Failed to delete cleaner");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = isEditing ? "PUT" : "POST";
      // const url = isEditing
      //   ? `http://essentialscleaner.com/api/cleaners/${editId}`
      //   : "http://essentialscleaner.com/api/cleaners";
      const url = isEditing
        ? `/api/cleaners/${editId}`
        : "/api/cleaners";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Admin-Code": adminCode,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save cleaner");

      const data = await res.json();
      if (isEditing) {
        setCleaners(cleaners.map((c) => (c._id === editId ? data : c)));
      } else {
        setCleaners([...cleaners, data]);
      }

      setFormData({ name: "", contactInfo:{ email:"" ,phone: ""} });
      setIsEditing(false);
      setEditId(null);
      setIsModalOpen(false);
      alert("Cleaner saved successfully!");
    } catch (err) {
      alert(err.message || "Failed to save cleaner");
    }
  };

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

  if (!isAuthorized) {
    return (
      <div className={styles.authContainer}>
        <form onSubmit={handleAdminCodeSubmit} className={styles.authForm}>
          <h1>Admin Login</h1>
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

  return (
    <div className={styles.container}>
      <h1>Manage Cleaners</h1>

      <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
        Add Cleaner
      </button>

      {/* Modal for adding or editing a cleaner */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{isEditing ? "Edit Cleaner" : "Add Cleaner"}</h2>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                required
                className={styles.input}
                />
              <input
                type="text"
                placeholder="Phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                required
                className={styles.input}
                />
              <select
                name="availability"
                value={formData.availability}
                onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                className={styles.input}
                >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
            </select>
              <button type="submit" className={styles.btn}>
                {isEditing ? "Update Cleaner" : "Add Cleaner"}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cleaners.map((cleaner) => (
            <tr key={cleaner._id}>
              <td>{cleaner.name}</td>
              <td>{cleaner.contactInfo.email}</td>
              <td>{cleaner.contactInfo.phone}</td>
              <td>{cleaner.availability}</td>
              <td>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditId(cleaner._id);
                    setIsModalOpen(true);
                    setFormData({ name: cleaner.name, contactInfo:{email: cleaner.contactInfo.email ,phone: cleaner.contactInfo.phone}, availability: cleaner.availability });
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(cleaner._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cleaners;
