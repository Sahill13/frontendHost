import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets"; 

const MyOrders = () => {
    const { url, token, orderId: contextOrderId,waitingForApproval } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [orderStatus, setOrderStatus] = useState("");
    const [waiting, setWaiting] = useState(false);
    const [disableNavbar, setDisableNavbar] = useState(true);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    const navigate = useNavigate();

    const storedOrderId = localStorage.getItem("pendingOrderId");
    const orderId = contextOrderId || storedOrderId; // Ensure orderId is always available

    useEffect(() => {
        if (waitingForApproval) {
            setWaiting(true);
        }
    }, [waitingForApproval]);

    // ✅ Load Razorpay Script
    useEffect(() => {
        const loadRazorpayScript = async () => {
            if (window.Razorpay) {
                console.log("✅ Razorpay script already loaded");
                return;
            }
    
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
    
            script.onload = () => {
                console.log("✅ Razorpay script loaded successfully!");
            };
    
            script.onerror = () => {
                console.error("❌ Failed to load Razorpay script");
                toast.error("Payment gateway failed to load. Refresh the page.");
            };
    
            document.body.appendChild(script);
        };
    
        loadRazorpayScript();
    }, []);

    // ✅ Fetch user orders
    const fetchOrders = async () => {
        try {
            const response = await axios.post(
                `${url}/api/order/userorders`,
                { status: "completed" },
                { headers: { token } }
            );
            console.log("📦 Raw fetched orders:", response.data.data);
            if (response.data.data) {
                const paidOrders = response.data.data.filter(
                    (order) => order.paymentStatus === "paid" || order.payment === true
                );
                console.log("✅ Filtered paid orders:", paidOrders);
                if (paidOrders.length === 0) {
                    console.warn("⚠️ No paid orders found even though data was returned.");
                }
                const sortedOrders = paidOrders.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setData(sortedOrders);
            }else {
                console.warn("⚠️ No orders returned from backend.");
            }
        } catch (error) {
            console.error("Error fetching orders:", error.response?.data || error.message);
        }
    };
    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    return (
        <div className="my-orders">
            <h2>My Orders</h2>
    
            {waitingForApproval && (
                <div className="waiting-message">
                    <p>Waiting for Admin Approval...</p>
                    <div className="spinner"></div>
                </div>
            )}
    
            <div className="container">
                {data.map((order, index) => (
                    <div key={index} className="my-orders-order">
    
                        {/* Order Icon */}
                        <img src={assets.parcel_icon} alt="Order Icon" />
    
                        {/* Order Details */}
                        <div className="order-details">
                            <h4>Order #{order.orderNumber || "N/A"}</h4>
                            <p className="order-item-list">
                                {order.items.map((item, idx) =>
                                    idx === order.items.length - 1
                                        ? `${item.name} x${item.quantity}`
                                        : `${item.name} x${item.quantity}, `
                                )}
                            </p>
    
                            <p className="order-amount">₹{order.amount}.00</p>
                            <p className="order-items">Items: {order.items.length}</p>
    
            {order.orderType === "Takeaway" ? (
            <>
            <p className="order-address"><strong>Pickup from cafeteria</strong></p>
            {order.pickupTime && (
            <p className="pickup-time">
            <strong>Pickup Time:</strong> {new Date(order.pickupTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
            </p>
            )}
            </>
        ) : (
        <p className="order-address">
            <strong>Delivery Address:</strong> {order.address?.block}, {order.address?.hostel}, Floor: {order.address?.floorNo}, Room: {order.address?.roomNo}, {order.address?.anyOtherLocation}
        </p>
        )}
    
                            <p className="order-date-time">
                                <strong>Placed on:</strong>{" "}
                                <span className="order-date">{new Date(order.date).toLocaleDateString("en-IN")}</span>{" "}
                                <span className="order-time">{new Date(order.date).toLocaleTimeString("en-IN")}</span>
                            </p>
                        </div>
    
                        {/* Status and Actions */}
                        <div className="order-actions">
                            <div className="order-status">● {order.status}</div>
    
                            {order.status === "approved" && (
                                <button 
                                    className="pay-now-btn"
                                    onClick={() => {
                                        if (!razorpayLoaded) {
                                            toast.error("Payment gateway is still loading...");
                                            return;
                                        }
                                        if (typeof window.Razorpay !== "undefined") {
                                            startRazorpayPayment(order._id);
                                        } else {
                                            toast.error("Payment gateway not available!");
                                        }
                                    }}
                                >
                                    Pay Now
                                </button>
                            )}
    
                            <button className="track-order-btn" onClick={fetchOrders}>
                                Track Order
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
