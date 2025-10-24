import React from 'react';
import './InventoryNav.css';
import InventoryHeader from './InventoryHeader';
import Footer from '../Footer';
import CartButton from './CartButton';

const InventoryNav = () => {
  return (
    <div className="InventoryNavContainer">
        <InventoryHeader />
        <Footer />
        <CartButton />
    </div>
  );
}

export default InventoryNav;