import React, { useState, useEffect,useRef } from 'react';
import "./Header.css"
import advertisement1 from "/src/assets/media/advertisement1.0d2d0980f5bbf5482e13.gif"
import advertisement2 from "/src/assets/media/advertisement2.fbc9ffb8f83e4c5c1af6.gif"
import advertisement3 from "/src/assets/media/advertisement3.b65422d0c613d86bad4b.gif"
import advertisement4 from "/src/assets/media/advertisement4.0dac7503121ebc831ac7.gif"
import advertisement5 from "/src/assets/media/advertisement5.df5602d5b73973b33525.gif"
import advertisement6 from "/src/assets/media/advertisement6.86309b9f7ed4cd02ed79.gif"
import advertisement7 from "/src/assets/media/advertisement7.1c31be953490f4cc2a4c.gif"
import advertisement8 from "/src/assets/media/advertisement8.56c1e17a06d97dd0af3c.gif"
import advertisementvVideo1 from "/src/assets/media/GIF1.4cc2e5835a49fe1f4719.gif"
import advertisementvVideo2 from "/src/assets/media/GIF2.267072365a9ac44ff737.gif"
import advertisementvVideo4 from "/src/assets/media/GIF4.a21217ae47c433c50d11.gif"
// import advertisementvVideo3 from "/src/assets/media/GIF3.gif"


const Header = () => {

  const advertisements = [
    advertisement1,
    advertisement2,
    advertisement3,
    advertisement4,
    advertisement5,
    advertisement6,
    advertisement7,
    advertisement8,
  ];

    const [currentImage, setCurrentImage] = useState(0);
    const intervalId = useRef(null);
  
    useEffect(() => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      intervalId.current = setInterval(() => {
        setCurrentImage((currentImage) => (currentImage === advertisements.length - 1 ? 0 : currentImage + 1));
      }, 7000);
  
      return () => {
        clearInterval(intervalId.current);
      };
    }, [advertisements.length]);



  const videos = [
    advertisementvVideo4,
    advertisementvVideo1,
    advertisementvVideo2,
    // advertisementvVideo3,
  ];
  const [currentVideo, setCurrentVideo] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo(currentVideo === videos.length - 1 ? 0 : currentVideo + 1);
    }, 6500);
  
    return () => clearInterval(interval);
  }, [currentVideo, videos.length]);

  return (
<div  id="home" className='homePageHeaderContainer'>
<div className="headerContainerMobile">
      <center>
        <img src={advertisements[currentImage]} className="headerParallaxContainer" alt="Advertisement Ancars Motors Inc." />
      </center>
    </div>

<div className='headerContainerWeb'>
<center>
<img src={videos[currentVideo]} className='headerParallaxContainer' alt="Advertisement Ancars Motors Inc." />
</center>
</div>

<div className='aboutContainer'>
<h1 className='aboutHeader'>ABOUT US</h1>
<p className='aboutDetails'>Our business is in marketing of imported and reconditioned Japanese trucks, special-purpose vehicles such as tractor head, tanker, dump and fire trucks, SUVs, and heavy equipment. Our company carries Isuzu, Fuso, Mitsubishi, and Suzuki brands of reliable quality and performance in the Japanese and Philippine market. Types of body include standard flat bed, low or high-dropside, palletized, and stake-body. Our company can also provide the standard aluminum van to wing-van type and customized chiller and freezer vans and any customized body and/or unit preferred.</p>
{/* <p className='aboutDetails'>Our business is in marketing of imported and reconditioned Japanese trucks, special-purpose vehiclessuch as tractor head, tanker, dump and fire trucks, SUVs, and heavy equipment. Our company carries Isuzu, Hino, Fuso, Toyota, Mitsubishi, and Suzuki brands of reliable quality and performance in theJapanese and Philippine market. Types of body include standard flat bed, low- or high-dropside, palletized,stake-body. Our company can also provide the standard aluminum van to wing-van type and customizedchiller and freezer vans and any customized body and/or unit preferred.</p> */}
</div>

</div>

  )
}

export default Header