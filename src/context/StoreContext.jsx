import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ Import toast for notifications

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState([]);
    const [orderId, setOrderId] = useState(localStorage.getItem("pendingOrderId") || null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [showFloatingCart, setShowFloatingCart] = useState(false);
    const [globalNotification, setGlobalNotification] = useState(""); // ✅ State for global notification
    const [superCoins, setSuperCoins] = useState(0); // ✅ SuperCoin Balance
    //globaal 
    const [waitingForApproval, setWaitingForApproval] = useState(false);
    const [disableNavbar, setDisableNavbar] = useState(false);
    const [orderStatus, setOrderStatus] = useState("");


    const url =import.meta.env.VITE_BACKEND_URL ;

    console.log("🌐 BACKEND URL:", url);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
    
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    // ✅ Load cart from localStorage when app starts
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
        setCartItems(savedCart);
        setShowFloatingCart(Object.keys(savedCart).length > 0);
    }, []);

    // ✅ Sync cart with localStorage whenever cartItems changes
    useEffect(() => {
        if (Object.keys(cartItems).length > 0) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            setShowFloatingCart(true);
        } else {
            localStorage.removeItem("cartItems");
            setShowFloatingCart(false);
        }
    }, [cartItems]);

    const addToCart = async (itemId, cafeteriaId) => {
        try {
            if (!cafeteriaId || cafeteriaId === "null") {
                cafeteriaId = localStorage.getItem("cafeteriaId");
                if (!cafeteriaId || cafeteriaId === "null") {
                    alert("❌ Please select a cafeteria first!");
                    return;
                }
            }

            const existingCafeteria = localStorage.getItem("cartCafeteriaId");
            if (existingCafeteria && existingCafeteria !== cafeteriaId) {
                alert("❌ You can only order from one cafeteria at a time! Clear your cart first.");
                return;
            }

            const response = await axios.post(`${url}/api/cart/add`, {
                userId: localStorage.getItem("userId"),
                itemId,
                cafeteriaId,
            }, { headers: { token: localStorage.getItem("token") } });

            if (!response.data.success) {
                alert(response.data.message);
                return;
            }

            if (!existingCafeteria) {
                localStorage.setItem("cartCafeteriaId", cafeteriaId);
            }

            setCartItems((prev) => ({
                ...prev,
                [itemId]: (prev[itemId] || 0) + 1
            }));

        } catch (error) {
            console.error("❌ Error adding item to cart:", error);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            setCartItems((prev) => {
                const updatedCart = { ...prev };
                if (updatedCart[itemId] > 1) {
                    updatedCart[itemId] -= 1;
                } else {
                    delete updatedCart[itemId];
                }

                if (Object.keys(updatedCart).length === 0) {
                    localStorage.removeItem("cartCafeteriaId");
                    setShowFloatingCart(false);
                }

                return updatedCart;
            });

            if (token) {
                await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
            }

        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        
        const foodListMap = food_list.reduce((map, item) => {
            map[item._id] = item;
            return map;
        }, {});

        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const itemInfo = foodListMap[itemId];
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[itemId];
                } else {
                    console.warn(`⚠️ Item with ID ${itemId} not found in food_list`);
                }
            }
        }

        return totalAmount;
    };

    const fetchFoodList = async () => {
        try {
            const cafeteriaId = (localStorage.getItem("cafeteriaId") || "mblock").trim().toLowerCase().replace(/\s+/g, '-');
            localStorage.setItem("cafeteriaId", cafeteriaId);

            console.log(`🚀 Fetching food for cafeteria: ${cafeteriaId}`);
            
            const response = await axios.get(`${url}/api/food/list?cafeteriaId=${cafeteriaId}`);
            if (response.data.success) {
                console.log("✅ Food fetched:", response.data.data);
                setFoodList(response.data.data);
            } else {
                console.error("⚠️ Error fetching food:", response.data.message);
            }
        } catch (error) {
            console.error("❌ Error fetching food list:", error);
        }
    };

    const loadCartData = async (token) => {
        try {
            const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } });
            setCartItems(response.data.cartData);
        } catch (error) {
            console.error("Error loading cart data:", error);
        }
    };

    const clearCart = async () => {
        console.log("🛠️ Clearing cart...");
    
        try {
            const response = await axios.post(`${url}/api/cart/clear`, {
                userId: localStorage.getItem("userId"),
            }, { headers: { token: localStorage.getItem("token") } });

            if (!response.data.success) {
                console.error("❌ Error clearing cart from server:", response.data.message);
                return;
            }

            console.log("✅ Server cart cleared");

            localStorage.removeItem("cartItems");
            localStorage.removeItem("cartCafeteriaId");

            setCartItems({});
            console.log("✅ Cart cleared successfully!");

        } catch (error) {
            console.error("❌ Error clearing cart:", error);
        }
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            const savedToken = localStorage.getItem("token");
            const savedUser = JSON.parse(localStorage.getItem("user"));
            if (savedToken) {
                setToken(savedToken);
                if (savedUser) {
                    setUser(savedUser);
                }
                try {
                    await loadCartData(savedToken);
                } catch (error) {
                    console.error("Error loading cart data", error);
                }
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        console.log("🛠️ Checking cart items...");
        const isCartEmpty = Object.keys(cartItems).length === 0;

        if (isCartEmpty) {
            console.log("✅ Cart is empty, resetting cafeteria selection...");
            localStorage.removeItem("cartCafeteriaId");
        }
    }, [cartItems]);

    useEffect(() => {
        if (orderId) {
            localStorage.setItem("pendingOrderId", orderId);
        }
    }, [orderId]);

    useEffect(() => {
        if (token) {
            axios.get(`${url}/api/user/supercoins`, { headers: { token } })
                .then(response => setSuperCoins(response.data.superCoins))
                .catch(error => console.error("Error fetching SuperCoins:", error));
        }
    }, [token]);

    // ✅ Function to add SuperCoins after an order
    const addSuperCoins = async (amountSpent) => {
        const earnedCoins = Math.floor(amountSpent / 50); // 🔹 Earn 1 coin per ₹50
        if (earnedCoins > 0) {
            setSuperCoins(prev => prev + earnedCoins);
            await axios.post(`${url}/api/user/addsupercoins`, { earnedCoins }, { headers: { token } });
        }
    };

    // ✅ Function to redeem SuperCoins at checkout
    const redeemSuperCoins = (orderAmount) => {
        const maxRedeem = Math.min(superCoins, Math.floor(orderAmount * 0.1)); // 🔹 Max 10% discount
        setSuperCoins(prev => prev - maxRedeem);
        return maxRedeem;
    };

    const startPolling = (orderId) => {
        setWaitingForApproval(true);
        setDisableNavbar(true);
      
        const timeout = setTimeout(() => setDisableNavbar(false), 120000);
      
        const interval = setInterval(async () => {
          try {
            const response = await axios.get(`${url}/api/order/order/${orderId}`, { headers: { token } });
            const { status, razorpay_order_id, amount, currency, razorpayKey } = response.data;
            setOrderStatus(status);
      
            if (status === "approved") {
              const isRazorpayLoaded = await loadRazorpayScript();
              if (!isRazorpayLoaded) {
                toast.error("❌ Razorpay SDK failed to load. Please refresh.");
                return;
              }
      
              const options = {
                key: razorpayKey,
                amount: amount * 100,
                currency,
                name: "CravIn",
                description: "Food Order Payment",
                order_id: razorpay_order_id,
                handler: async (paymentResponse) => {
                  try {
                    await axios.post(`${url}/api/order/verify`, {
                      paymentResponse,
                      orderId
                    }, { headers: { token } });
      
                    toast.success("✅ Payment successful!");
                  } catch (error) {
                    console.error("Payment verification failed:", error);
                    toast.error("❌ Payment verification failed.");
                  }
                },
                prefill: {
                  name: "Sahil Gupta",
                  email: "sahil@example.com",
                  contact: "9999999999",
                },
                theme: { color: "#F37254" }
              };
      
              const razorpayInstance = new window.Razorpay(options);
              razorpayInstance.open();
            }
      
            if (["approved", "paid", "rejected"].includes(status)) {
              clearInterval(interval);
              clearTimeout(timeout);
              localStorage.removeItem("pendingOrderId");
              setWaitingForApproval(false);
              setDisableNavbar(false);
            }
      
            if (status === "rejected") {
              toast.error("❌ Order rejected by cafeteria.");
            } else if (status === "paid") {
              toast.success("✅ Order already paid.");
            }
      
          } catch (error) {
            console.error("Polling error:", error);
            clearInterval(interval);
            clearTimeout(timeout);
            setWaitingForApproval(false);
            setDisableNavbar(false);
            localStorage.removeItem("pendingOrderId");
          }
        }, 15000);
      };
      
    useEffect(() => {
        const orderId = localStorage.getItem("pendingOrderId");
        if (!orderId) return;
        startPolling(orderId);
      }, [token]); // This handles refresh or token change
    


    const contextValue = {
        food_list,
        cartItems,
        setFoodList,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        orderId,
        setOrderId,
        clearCart,
        showFloatingCart,
        globalNotification, // ✅ Expose globalNotification
        superCoins, 
        addSuperCoins, 
        redeemSuperCoins,
        waitingForApproval,
        setWaitingForApproval,
        startPolling
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
