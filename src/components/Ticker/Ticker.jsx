import React from "react";
import "./Ticker.css";

const Ticker = () => {
  return (
    <div className="ticker-container">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          <span>📢 Order Timings: 10:00 AM - 10:00 PM</span>
          <span>🔥 Enjoy delicious meals with fast delivery!</span>
          <span>🚀 Special discounts available for bulk orders!</span>
          <span>🎉 Use SuperCoins to get discounts on your order!</span>
        </div>
      </div>
    </div>
  );
};

export default Ticker;
