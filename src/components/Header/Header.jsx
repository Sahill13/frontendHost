import React, { useState, useEffect } from "react";
import "./Header.css";

const quotes = [
  "Good food is the foundation of happiness.",
  "One cannot think well, love well, sleep well, if one has not dined well.",
  "Food is symbolic of love when words are inadequate.",
  "You don’t need a silver fork to eat good food.",
  "Life is uncertain. Eat dessert first.",
  "People who love to eat are always the best people.",
  "First we eat, then we do everything else.",
  "A balanced diet is a cookie in each hand."
];

const Header = () => {
  const [index, setIndex] = useState(0);

  // ✅ Temporary local backend URL
  const baseURL = import.meta.env.VITE_BACKEND_URL ;

  const images = [
    `${baseURL}/images/vegfriedrice.jpg`,
    `${baseURL}/images/manchuriandry&gravy.jpg`,
    `${baseURL}/images/chillipaneerdry&gravy.jpg`,
    `${baseURL}/images/header_img.png`,
    `${baseURL}/images/springroll.jpg`,
    `${baseURL}/images/momos.jpg`,
    `${baseURL}/images/friedmomos.jpg`
  ];

  const preloadImages = (imageArray) => {
    imageArray.forEach((image) => {
      const img = new Image();
      img.src = image;
    });
  };

  useEffect(() => {
    preloadImages(images);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="header" style={{ backgroundImage: `url(${images[index]})` }}>
      <div className="header-contents fade-in">
        <h2>Order Your Favourite Food Here</h2>
        <p>{quotes[index]}</p>
      </div>
    </div>
  );
};

export default Header;
