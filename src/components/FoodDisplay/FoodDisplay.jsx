import React, { useContext, useEffect, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FloatingCart from '../FloatingCart/FloatingCart';
import FoodItem from '../FoodItem/FoodItem';
import axios from 'axios';

const FoodDisplay = ({ category, url }) => {
    const { food_list, setFoodList } = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Ensure cafeteriaId is formatted correctly
    const cafeteriaId = (localStorage.getItem("cafeteriaId") || "mblock")
        .trim().toLowerCase().replace(/\s+/g, '-');  

        useEffect(() => {
            const fetchFood = async () => {
                try {
                    let storedCafeteriaId = localStorage.getItem("cafeteriaId") || "mblock";
                    storedCafeteriaId = storedCafeteriaId.trim().toLowerCase().replace(/\s+/g, '-');
        
                    // ✅ Log the full URL to check if it's correct
                    const apiUrl = `${url}/api/food/list?cafeteriaId=${storedCafeteriaId}`;
                    console.log(`🚀 Fetching food from: ${apiUrl}`);
        
                    const response = await axios.get(apiUrl, {
                        headers: { Accept: "application/json" }
                    });
        
                    console.log("🔍 Full API Response:", response);
        
                    if (!response.data || typeof response.data !== "object" || !response.data.success || !Array.isArray(response.data.data)) {
                        console.error("❌ Invalid response format:", response);
                        throw new Error("Invalid response format from server!");
                    }
        
                    console.log("✅ Food fetched:", response.data.data);
                    setFoodList(response.data.data);
                    setError(null);
                } catch (error) {
                    console.error("❌ Error fetching food items:", error.message);
                    setError(error.message || "Failed to load food items.");
                } finally {
                    setLoading(false); // ✅ Set loading to false after fetching
                }
            };
        
            fetchFood();
        }, [url, setFoodList]); // ✅ Correct dependencies
        

    return (
        <div className="food-display" id="food-display">
            <h2>Top Dishes Near You</h2>
            <FloatingCart />
            {loading ? <p>Loading food items...</p> : null}
            {error ? <p className="error">{error}</p> : null}

            <div className="food-display-list">
                {food_list.length === 0 && !loading ? <p>No food available for this cafeteria.</p> : null}

                {food_list.map((item, index) => {
                    if ((category === "All" || category === item.category) && item.cafeteriaId === cafeteriaId) {
                        return (
                            <div key={index} id={`food-${item._id}`}>
                                <FoodItem 
                                    id={item._id} 
                                    name={item.name} 
                                    description={item.description} 
                                    price={item.price} 
                                    image={item.image} 
                                />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default FoodDisplay;
