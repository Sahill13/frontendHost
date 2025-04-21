import React, { useEffect, useContext, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    setOrderId,
    setWaitingForApproval,
    startPolling,
  } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    block: '',
    hostel: '',
    floorNo: '',
    roomNo: '',
    otherLocation: '',
    phone: '',
    orderType: 'Delivery',
  });

  const [showBlock, setShowBlock] = useState(true);
  const [showHostel, setShowHostel] = useState(true);
  const [showOtherLocation, setShowOtherLocation] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const redeemAmount = Number(sessionStorage.getItem('redeemAmount')) || 0;

  useEffect(() => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
      setTotalAmount(0);
      return;
    }

    let calculatedTotal = 0;

    for (const itemId in cartItems) {
      const item = food_list.find((food) => food._id === itemId);
      if (item && item.price) {
        calculatedTotal += item.price * cartItems[item._id];
      }
    }

    setTotalAmount(calculatedTotal);
  }, [cartItems, food_list]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    const numberFields = ['floorNo', 'roomNo', 'phone'];

    if (numberFields.includes(name)) {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) {
        toast.warn(`${name === 'phone' ? 'Phone number' : name} cannot exceed 10 digits`);
        return;
      }
    }

    const nameFields = ['firstName', 'lastName'];
    if (nameFields.includes(name)) {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        toast.warn(`${name === 'firstName' ? 'First name' : 'Last name'} can only contain letters`);
        return;
      }
    }

    setData((prev) => ({ ...prev, [name]: value }));

    if (name === 'block') {
      if (value === 'None') setShowHostel(true);
      else if (value === 'Other') {
        setShowOtherLocation(true);
        setShowHostel(false);
      } else {
        setShowOtherLocation(false);
        setShowHostel(false);
      }
    }

    if (name === 'hostel') {
      setShowBlock(value === 'None');
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (data.phone.length !== 10 || !/^[6-9]\d{9}$/.test(data.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    let cafeteriaId = localStorage.getItem('cafeteriaId') || 'mblock';
    if (!cafeteriaId) {
      toast.error('❌ Please select a cafeteria before placing an order!');
      return;
    }

    cafeteriaId = cafeteriaId.toLowerCase().trim().replace(/\s+/g, '-');

    let orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        ...item,
        quantity: cartItems[item._id],
      }));

    const deliveryFee = data.orderType === 'Takeaway' ? 0 : 2;
    const discountedAmount = totalAmount + deliveryFee - redeemAmount;

    const orderData = {
      userId: localStorage.getItem('userId'),
      address: data,
      items: orderItems,
      amount: discountedAmount,
      status: 'pending',
      cafeteriaId,
      redeemedSuperCoins: redeemAmount,
      orderType: data.orderType,
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });

      const { success, orderId } = response.data;

      if (success) {
        if (redeemAmount > 0) {
          // ✅ Only deduct SuperCoins if order was placed successfully
          await axios.post(
            `${url}/api/user/redeemsupercoins`,
            {
              redeemAmount,
              userId: localStorage.getItem('userId'),
            },
            {
              headers: { token },
            }
          );
        }

        localStorage.setItem('pendingOrderId', orderId);
        setOrderId(orderId);
        setWaitingForApproval(true);
        localStorage.removeItem('redeemAmount');
        sessionStorage.removeItem('redeemAmount');

        toast.info('Your order is awaiting admin approval');
        startPolling(orderId);
        navigate('/myorders');
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('Please login to place an order');
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
      toast.error('Cart is empty');
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder="First Name" />
          <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder="Last Name" />
        </div>

        <input required name="studentId" onChange={onChangeHandler} value={data.studentId} type="text" placeholder="Student ID" />

        {data.orderType === 'Delivery' && (
          <>
            {showBlock && (
              <div className="flex-col">
                <select required name="block" onChange={onChangeHandler} value={data.block}>
                  <option value="None">Select Block</option>
                  <option value="M-block">M-block</option>
                  <option value="AB-3">AB-3</option>
                  <option value="T-Block">T-Block</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {showOtherLocation && (
              <input required name="otherLocation" onChange={onChangeHandler} value={data.otherLocation} type="text" placeholder="Enter Other Location" />
            )}

            {showHostel && (
              <div className="flex-col">
                <select required name="hostel" onChange={onChangeHandler} value={data.hostel}>
                  <option value="None">Select Hostel</option>
                  <option value="Himgiri">Himgiri</option>
                  <option value="Himalaya">Himalaya</option>
                  <option value="Shivalik">Shivalik</option>
                  <option value="Nilgiri">Nilgiri</option>
                  <option value="Kaveri">Kaveri</option>
                  <option value="Narmada">Narmada</option>
                </select>
              </div>
            )}

            <input required name="floorNo" onChange={onChangeHandler} value={data.floorNo} type="text" placeholder="Floor No." />
            <input required name="roomNo" onChange={onChangeHandler} value={data.roomNo} type="text" placeholder="Room No." />
          </>
        )}

        <input required name="phone" onChange={onChangeHandler} value={data.phone} type="text" inputMode="numeric" placeholder="Phone" maxLength={10} />
      </div>

      <div className="order-type-toggle">
        <label>
          <input
            type="radio"
            value="Delivery"
            checked={data.orderType !== 'Takeaway'}
            onChange={() => setData((prev) => ({ ...prev, orderType: 'Delivery' }))}
          />
          Delivery
        </label>
        <label>
          <input
            type="radio"
            value="Takeaway"
            checked={data.orderType === 'Takeaway'}
            onChange={() => setData((prev) => ({ ...prev, orderType: 'Takeaway' }))}
          />
          Takeaway (Skip Delivery Charges)
        </label>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{totalAmount}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{data.orderType === 'Takeaway' || totalAmount === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>SuperCoin Discount</p>
              <p>-₹{redeemAmount}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{totalAmount + (data.orderType === 'Takeaway' || totalAmount === 0 ? 0 : 2) - redeemAmount}</b>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
