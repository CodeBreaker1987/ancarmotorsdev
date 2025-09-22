import React from 'react';
import "./BrandAvailable.css";
 import FUSO from '/src/assets/media/Fuso.67c7ad97cab6818ba9a2.jpg';
// import SHANTUI from '../images/Shantui.jpg';
import ISUZU from '/src/assets/media/Isuzu.04cdea84e0ee8dd01f09.jpg';
import HINO from '/src/assets/media/Hino.024295a813f500baa225.jpg';
import SUSUKI from '/src/assets/media/Suzuki.9cb8da2501cdeef69197.jpg';
// import TOYOTA from '../images/Toyota.jpg';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css'; // Import default styles

const Header = () => {
  
  const images = [
    { original: FUSO, thumbnail: FUSO,  },
    // { original: SHANTUI, thumbnail: SHANTUI, },
    { original: ISUZU, thumbnail: ISUZU,  },
    { original: HINO, thumbnail: HINO,},
    { original: SUSUKI, thumbnail: SUSUKI, },
   // { original: TOYOTA, thumbnail: TOYOTA, }
  ];




  return (
    <div id="inventory" className='parallaxBrandAvailable'>
     
        <div >
            <div className='bAvailableContainer'>
            <h1 className='bAvailableHeader'>PARTNERSHIPS</h1>
            <p className='bAvailableDetails'>EXPERIENCE THE POWER AND DURABILITY OF YOUR DESIRED TRUCK BRAND.</p>
          </div>

         <div className="brandAvailableImageContainer">
          <ImageGallery
            items={images}
            showThumbnails={true}
            showPlayButton={false}
            showBullets={false}
            slideClass="image-gallery-slide" // Apply slide effect class
            autoPlay={true} 
            showFullscreenButton={false} 
            showNav={false}
            slideInterval={2000}
          />
          </div>
        </div>
     
    </div>
  );
};

export default Header;
