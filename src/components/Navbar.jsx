import React, { useContext, useEffect, useState } from "react";
import "./Navbar.css";
import { assets } from "../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { toast } from "react-toastify";

const Navbar = ({ setShowLogin }) => {
  const { superCoins,globalNotification,getTotalCartAmount, token, setToken, food_list, clearCart } = useContext(StoreContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [activeMenu, setActiveMenu] = useState("home");


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, [token]);

  useEffect(() => {
    if (location.hash) {
      setActiveMenu(location.hash.substring(1)); // ✅ Fix: Detecting `/#footer`
    } else if (location.pathname === "/") {
      setActiveMenu("home");
    } else {
      setActiveMenu("");
    }
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    navigate("/");
    clearCart();
    toast.success("Logged out successfully");
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const results = food_list.filter((item) => item.name.toLowerCase().includes(query));
      setFilteredFoods(results);
    } else {
      setFilteredFoods([]);
    }
  };

  const handleFoodClick = (foodId) => {
    const foodElement = document.getElementById(`food-${foodId}`);
    if (foodElement) {
        foodElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setShowSearch(false); // ✅ Close the search dropdown after clicking
};

  return (
    <div className="navbar">
       {/* ✅ Notification Banner */}
       {globalNotification && (
                  <div className={`notification-banner ${globalNotification.includes("approved") ? "success" : "error"}`}>
                    {globalNotification}
                </div>
            )}
            
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveMenu("home");
            window.location.href = "/";
          }}
          className={activeMenu === "home" ? "active" : ""}
        >
          Home
        </a>
        <a
          href="/#explore-menu"
          onClick={(e) => {
            e.preventDefault();
            setActiveMenu("explore-menu");
            window.location.href = "/#explore-menu";
          }}
          className={activeMenu === "explore-menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="/#app-download"
          onClick={(e) => {
            e.preventDefault();
            setActiveMenu("app-download");
            window.location.href = "/#app-download";
          }}
          className={activeMenu === "app-download" ? "active" : ""}
        >
          Mobile App
        </a>
        <a
          href="/#footer"
          onClick={(e) => {
            e.preventDefault();
            setActiveMenu("footer"); // ✅ Fix: Make sure footer updates active state
            window.location.href = "/#footer";
          }}
          className={activeMenu === "footer" ? "active" : ""}
        >
          Contact Us
        </a>
      </ul>

      <div className="navbar-right">
        <div className="search-container">
          <img src={assets.search_icon} alt="" onClick={() => setShowSearch(!showSearch)} />
          {showSearch && (
            <div className="search-dropdown">
              <input type="text" placeholder="Search food..." value={searchQuery} onChange={handleSearch} />
              {searchQuery && (
                <div className="search-results">
                  {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                      <div key={food._id} className="search-item" onClick={() => handleFoodClick(food._id)}>
                        <img src={`${import.meta.env.VITE_BACKEND_URL}/images/${food.image}`} alt={food.name} />
                        <p>{food.name}</p>
                      </div>
                    ))
                  ) : (
                    <p>No results found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/profile")}>
                <img src={assets.profile_icon} alt="" />
                <p>Profile</p>
              </li>
              <hr />
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
         {/* ✅ SuperCoin Balance Display */}
         {token && (
                <div className="supercoin-container">
                    <img src={assets.supercoin_icon} alt="SuperCoins" />
                    <span>{superCoins}</span>
                </div>
            )}
      </div>
    </div>
  );
};

export default Navbar;
