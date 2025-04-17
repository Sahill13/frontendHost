import React from 'react'
import'./Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img className='logoo' src={assets.logo} alt="" />
                <p>Are you excited to satisfy your cravings with just a tap? 🚀 *Cravinv* is here to bring your favorite food straight to your classroom, hostel, or even the ground—fresh, fast, and hassle-free! No more waiting in lines—just order, sit back, and enjoy. Because when cravings hit in campus, *Cravinv* has you covered! 🍔🔥🎉
                </p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                <li>8937087695</li>
                <li>sahilkingg13@gmail.com</li>
                </ul>
            </div>
           
        </div>
        <hr />
        <p className="footer-copyright">Copyright 2024 @ CravInv.com - All Right Reserved.</p>
    </div>
  )
}

export default Footer