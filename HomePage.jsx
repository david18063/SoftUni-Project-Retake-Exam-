import React from 'react';
import './style.css';
import './swiperStyles.css';

// Import Swiper styles
import 'swiper/css';

// Import Swiper styles
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import LeftContent from './LeftContent';
import RightContent from './RightContent';
import NavigationMenu from './NavigationMenu';
import Footer from './Footer';
import TopBar from './TopBar';
import Header from './Header';
import HomePageMainContent from './HomePageMainContent';

const MyWebsite = () => {
  return (
    <>
      <div id="main_container">

        <TopBar/>

        <Header/>

        <NavigationMenu/>

        <LeftContent />

        <HomePageMainContent/>

        <RightContent/>

      </div>

        <Footer/>
    </>
  );
};

export default MyWebsite;
