import React, { useState } from "react";
import InventoryHeader, { images } from "./InventoryHeader";
import TruckOrderForm from "./TruckOrderForm";
import Footer from "../Footer";

export default function InventoryPage() {
  const [selectedTruck, setSelectedTruck] = useState(null);

  return (
    <div>
      {/* Header allows truck selection */}
      <InventoryHeader
        images={images}                   // pass the truck data
        onSelectTruck={(truck) => setSelectedTruck(truck)} // save selected truck
      />

      {/* Show form if a truck is selected */}
      {selectedTruck && (
        <TruckOrderForm
          truck={selectedTruck}           // pass truck details to form
        />
      )}
    </div>
  );
   <Footer/>
}
