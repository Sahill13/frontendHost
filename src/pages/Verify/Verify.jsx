import React, { useEffect, useContext } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("razorpay_payment_id");
    const orderId = searchParams.get("razorpay_order_id");
    const signature = searchParams.get("razorpay_signature");

    console.log("🔥 Verify component mounted"); // <- this should always run

    const { url, clearCart } = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        console.log("========== 🔍 START PAYMENT VERIFICATION ==========");

        console.log("📌 STEP 1: Received URL Parameters:");
        console.log("👉 razorpay_payment_id:", paymentId);
        console.log("👉 razorpay_order_id:", orderId);
        console.log("👉 razorpay_signature:", signature);

        if (!paymentId || !orderId || !signature) {
            toast.error("Payment verification failed: Missing parameters.");
            console.error("❌ Missing one or more payment parameters");
            navigate("/");
            return;
        }

        const payload = {
            paymentResponse: {
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId,
                razorpay_signature: signature,
            },
            orderId: orderId,
        };

        try {
            console.log("📤 STEP 2: Sending payload to backend for verification:");
            console.log(JSON.stringify(payload, null, 2));

            const response = await axios.post(`${url}/api/order/verify`, payload, {
                withCredentials: true,
            });

            console.log("📬 STEP 3: Received response from backend:");
            console.log(JSON.stringify(response.data, null, 2));

            if (response.data.success) {
                console.log("✅ STEP 4: Verification success! Clearing cart...");
                clearCart();
                console.log("➡️ Redirecting to /myorders");
                console.log("========== ✅ PAYMENT VERIFIED SUCCESSFULLY ==========");
                navigate("/myorders");
            } else {
                console.log("❌ STEP 4: Verification failed according to backend.");
                console.log("➡️ Redirecting to /");
                console.log("========== ❌ VERIFICATION FAILED (Invalid Signature) ==========");
                navigate("/");
            }
        } catch (error) {
            console.log("🚨 STEP 4: Error occurred during verification:");
            if (error.response) {
                console.log("Error response from backend:", JSON.stringify(error.response.data, null, 2));
            } else {
                console.log("Error message:", error.message);
            }
            console.log("➡️ Redirecting to /");
            console.log("========== ❌ VERIFICATION FAILED (Server Error) ==========");
            navigate("/");
        }
    };

    useEffect(() => {
        console.log("🧪 useEffect triggered in Verify.jsx");
        console.log("🧾 Params:", { paymentId, orderId, signature });
        verifyPayment();
    }, [paymentId, orderId, signature]);

    return (
        <div className="verify">
            <div className="spinner"></div>
            <p>Verifying your payment, please wait...</p>
        </div>
    );
};

export default Verify;
