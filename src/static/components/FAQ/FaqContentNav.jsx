import React from 'react';
import './FaqContent.css';
import FaqContent from './FaqContent';
import Footer from '../Footer';
const FaqNav = () => {
  return (
    <div className="BrandAvailableNavNavContainer">
        <FaqContent />
        <Footer />
    </div>
  );
}

export default FaqNav;