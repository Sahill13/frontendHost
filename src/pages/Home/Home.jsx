import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = ({url}) => {
  const [category, setCategory] = useState("All");
  const [cafeteriaId, setCafeteriaId] = useState(localStorage.getItem("cafeteriaId") || ""); 

  return (
    <div>
    <Header />
    <ExploreMenu url={url} category={category} setCategory={setCategory} setCafeteriaId={setCafeteriaId} /> {/* ✅ Pass `url` & `setCafeteriaId` */}
    <FoodDisplay url={url} category={category} /> {/* ✅ Pass `url` */}
    <AppDownload />
</div>
  )
}

export default Home