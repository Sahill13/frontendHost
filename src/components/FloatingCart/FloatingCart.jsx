import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import "./FloatingCart.css";

const FloatingCart = () => {
    const { cartItems = {}, showFloatingCart } = useContext(StoreContext);
    const navigate = useNavigate();

   
    if (!showFloatingCart || Object.keys(cartItems || {}).length === 0) return null; // Ensure cartItems is always an object
    return (
        <div className={`floating-cart ${showFloatingCart ? "show" : "hide"}`}>
            <p>{Object.keys(cartItems).length} item(s) in cart</p>
            <button onClick={() => navigate("/cart")}>Go to Cart</button>
        </div>
    );
};

export default FloatingCart;
