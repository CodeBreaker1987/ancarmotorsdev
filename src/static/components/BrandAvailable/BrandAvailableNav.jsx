import React from 'react';
import './BrandAvailableNav.css';
import BrandAvailable from './BrandAvailable';
import Footer from '../Footer';
const BrandAvailableNav = () => {
  return (
    <div className="BrandAvailableNavNavContainer">
        <BrandAvailable />
        <Footer />
    </div>
  );
}

export default BrandAvailableNav;