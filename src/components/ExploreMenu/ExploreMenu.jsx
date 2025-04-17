import React, { useState, useEffect } from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../assets/assets';
import axios from 'axios';

const ExploreMenu = ({ category, setCategory, url, setCafeteriaId }) => {
  const [cafeterias, setCafeterias] = useState([
    { _id: "mblock", name: "mblock" }, 
    { _id: "ubblock", name: "ubblock" }
  ]);
  const [selectedCafeteria, setSelectedCafeteria] = useState(localStorage.getItem("cafeteriaId") || "");

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const response = await axios.get(`${url}/api/admin/cafeterias`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCafeterias(response.data);
        } 
      } catch (error) {
        console.error("⚠️ Error fetching cafeterias, using defaults:", error);
      }
    };
    fetchCafeterias();
  }, [url]);

  const handleCafeteriaChange = async (event) => {
    const cafeteriaId = event.target.value;
    if (!cafeteriaId) return;

    const storedCart = JSON.parse(localStorage.getItem("cartItems") || "{}");

    if (Object.keys(storedCart).length > 0) {
        const confirmClear = window.confirm("⚠️ Changing cafeteria will clear your cart. Do you want to proceed?");
        if (!confirmClear) return;

        // ✅ Clear cart from localStorage
        localStorage.removeItem("cartItems");
        localStorage.removeItem("cartCafeteriaId");

        try {
            // ✅ Use correct API URL (Ensure `url` is not undefined)
            const response = await axios.post(`${url}/api/cart/clear`, {
                userId: localStorage.getItem("userId"),
            }, {
                headers: { "Content-Type": "application/json", token: localStorage.getItem("token") }
            });

            if (!response.data.success) {
                alert("❌ Failed to clear cart on server");
                return;
            }

            console.log("✅ Cart cleared from backend and localStorage");
        } catch (error) {
            console.error("❌ Error clearing cart:", error);
            return;
        }
    }

    // ✅ Now update cafeteria selection
    localStorage.setItem("cafeteriaId", cafeteriaId);
    setSelectedCafeteria(cafeteriaId);
    setCafeteriaId(cafeteriaId);

    console.log("✅ Cafeteria changed to:", cafeteriaId);
    window.location.reload();
};

  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore Our Menu</h1>
        <p className='explore-menu-text'>
          Choose from a wide range of exotic food which will result in the most delicious taste you have ever had!
        </p>

        {/* ✅ Cafeteria Selection Dropdown */}
        <div className="cafeteria-selection">
          <label>Select Cafeteria:</label>
          <select value={selectedCafeteria} onChange={handleCafeteriaChange}>
            <option value="">-- Select Cafeteria --</option>
            {cafeterias.map((cafeteria) => (
              <option key={cafeteria._id} value={cafeteria._id}>
                {cafeteria.name}
              </option>
            ))}
          </select>
        </div>

        <div className="explore-menu-list">
            {menu_list.map((item, index) => (
                <div 
                  onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
                  key={index} 
                  className='explore-menu-list-item'
                >
                    <img className={category === item.menu_name ? "active" : ""} src={item.menu_image} alt="" />
                    <p>{ item.menu_name }</p>
                </div>
            ))}
        </div>
        <hr />
    </div>
  );
};

export default ExploreMenu;
