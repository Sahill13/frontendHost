import React, { useContext, useEffect, useRef, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";

function Cart() {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, superCoins, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [redeemAmount, setRedeemAmount] = useState(() => {
    return Number(localStorage.getItem("redeemAmount")) || 0;
});
  const cartRef = useRef(null); // 🔹 Create a reference for the cart container
  useEffect(() => {
    if (cartRef.current) {
        setTimeout(() => {
            cartRef.current.scrollTop = 0; // 🔹 Scroll to top AFTER render
        }, 0); // 🔹 Minimal delay ensures DOM updates first
    }
}, [cartItems]);

  const handleRedeem = async () => {
    const maxRedeem = Math.min(superCoins, Math.floor(getTotalCartAmount() * 0.1)); // Max 10% discount
    if (maxRedeem === 0) {
      toast.error("❌ Not enough SuperCoins to redeem!");
      return;
    }

    try {
      console.log(`🔄 Redeeming ${maxRedeem} SuperCoins...`);

      const response = await axios.post(
        `${url}/api/user/redeemsupercoins`,
        { redeemAmount: maxRedeem, userId: localStorage.getItem("userId") },
        { headers: { token } }
      );

      if (response.data.success) {
        console.log(`✅ SuperCoins Redeemed: ${maxRedeem}`);
        setRedeemAmount(maxRedeem);
        localStorage.setItem("redeemAmount", maxRedeem); // ✅ Save to local storage
        sessionStorage.setItem("redeemAmount", maxRedeem); // ✅ Store in sessionStorage too
        toast.success(`✅ Redeemed ₹${maxRedeem} from SuperCoins!`);
      } else {
        toast.error("❌ Failed to redeem SuperCoins!");
      }
    } catch (error) {
      console.error("❌ Error redeeming SuperCoins:", error);
      toast.error("❌ Error redeeming SuperCoins!");
    }
  };

  return (
    <div className="cart" ref={cartRef}>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">x</p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        {/* ✅ SuperCoins Section (More Compact) */}
        <div className="cart-supercoins">
  <div className="supercoins-info">
    <img src={assets.supercoin_icon} alt="SuperCoins" className="supercoin-logo" />
    <div>
      <p><b>Available SuperCoins:</b> {superCoins}</p>
      <p>Use SuperCoins to get a discount (Max 10%)</p>
    </div>
  </div>

  {redeemAmount === 0 ? (
    <button onClick={handleRedeem}>Redeem SuperCoins</button>
  ) : (
    <button onClick={() => {
      setRedeemAmount(0);
      localStorage.removeItem("redeemAmount");
      sessionStorage.removeItem("redeemAmount");
      toast.info("🔄 SuperCoin discount removed.");
    }}>
      Remove Redemption
    </button>
  )}
</div>


        {/* ✅ Cart Total Section */}
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-details-container">
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <div className="cart-total-details">
              <p>SuperCoin Discount</p>
              <p>- ₹{redeemAmount}</p>
            </div>
          </div>

          {/* ✅ Total Separated at the Bottom */}
          <div className="cart-total-final">
            <b>Total</b>
            <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2 - redeemAmount}</b>
          </div>

          <button onClick={() => navigate("/order", { state: { redeemAmount, discountedAmount: getTotalCartAmount() + 2 - redeemAmount } })}>
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}


export default Cart;
