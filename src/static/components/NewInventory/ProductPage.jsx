import TruckOrderForm from "./TruckOrderForm";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";

import "./ProductPage.css";

const ProductPage = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate(); // Add this line
  const truck = location.state?.truck;

  // If truck prop is not passed, show error
  if (!truck) {
    return <h2 className="text-center text-red-600">Product not found 🚚</h2>;
  }

  console.log("Product found:", truck);

  return (
    <div className="productPageContainer">
      {/* === Static Image === */}
      <div className="returnButtonContainer">
        <button
          className="returnButton"
          onClick={() => navigate("/InventoryNav")} // Redirect to InventoryNav
        >
          ◁ Return
        </button>
      </div>
      <div className="productGallery">
        <img
          src={truck.thumbnail}
          alt={truck.description}
          className="productImage"
        />
      </div>

      {/* === Product Info === */}
      <div className="productInfo">
        <div className="productStyle">
        <h1 className="productTitle">{truck.description}</h1>
        <p className="productDetails">{truck.Details}</p>
        </div>
        {/* === Truck Order Form === */}
        <TruckOrderForm truck={truck} basePrice={truck.basePrice} user={user}/>
      </div>
    </div>
  );
};

export default ProductPage;
