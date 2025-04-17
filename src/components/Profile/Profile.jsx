import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
const Profile = () => {
  const { token } = useContext(StoreContext); // Track token updates
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      // Fetch user data from localStorage and handle potential parsing errors
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null); // Ensure user is explicitly set to null if no data exists
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser(null);
    }
  }, [token]);

  // ✅ Prevent crash: Show loading message if `user` is null
  if (!user) {
    return <h2 className="profile-message">Please log in to view your profile.</h2>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-card">
        <img src={assets.profile_icon} alt="User Avatar" />
        <h3>{user?.name || "N/A"}</h3>
        <p><strong>Email:</strong> {user?.email || "N/A"}</p>
        <p><strong>Member Since:</strong> {user?.joinDate || "N/A"}</p>
        <p><strong>Security Code:</strong> <span style={{ fontSize: "20px", fontWeight: "bold" }}>{user?.securityCode || "Not Available"}</span></p>
      </div>
    </div>
  );
};

export default Profile;
