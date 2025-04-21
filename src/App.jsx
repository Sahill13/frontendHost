import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import {Routes , Route} from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import Home from './pages/Home/Home'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './components/Profile/Profile'
import Ticker from './components/Ticker/Ticker'
import SplashScreen from './components/SplashScreen/SplashScreen'; // ✅ Import splash screen

const App = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL ; // ✅ Define URL here
  const [showLogin,setShowLogin]=useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ Splash screen state

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) return <SplashScreen />; // ✅ Show splash screen before everything


  return (<>
  {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <ToastContainer/>
      <Navbar setShowLogin={setShowLogin}/>
      <Ticker/>
      <Routes>
        <Route path='/' element={<Home url={backendUrl} />}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/order" element={<PlaceOrder/>}/>
        <Route path="/verify" element={<Verify/>}/>
        <Route path="/myorders" element={<MyOrders/>}/>
        <Route path="/profile" element={<Profile />} />
        
      </Routes>
    </div>
    <Footer/>
    </>
  )
}

export default App