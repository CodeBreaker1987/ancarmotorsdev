import React from 'react';
import "./Brand.css";
import IntroAncarmotors from "/src/assets/media/IntroAncarmotors.35582d14a9e6f5d93416.mp4";
import bulb from '/src/assets/media/bulb.13235cae26a5035637a5.png';
import adhere from '/src/assets/media/adhere.7ca87a4e61ab96ce3a3b.png';
import check from '/src/assets/media/check.89906cfab84eac149de1.png';
import truckPhilippines from '/src/assets/media/truckPhilippines.78d2586536e2ac5ae167.png';

const Brand = () => {

  return (
    <div id="Brand" className='parallaxBrand'>

<div className='missionContainer'>
<h1 className='brandMissionHeader'>MISSION</h1>
<h3 className='brandMissionDetails'>We commit to:</h3>
                  <table className="branchTableContainer">
  <tbody>
    <tr>
    <td data-label="Service" className="branchContainerTd">
      <img src={bulb} className='branchContainerIconMapStyle' alt="bulb"/>
        <h1 className='branchContainerBranchName'>
      Continuously help imporve the welfare of our people towards growth within the company.
         </h1>
      </td>
  
      <td data-label="Service" className="branchContainerTd">
      <img src={adhere} className='branchContainerIconMapStyle' alt="adhere"/>
        <h1 className='branchContainerBranchName'>
      Adhere to the environmental standards and meet the expectations of the clients and stakeholders.
         </h1>
      </td>
    
      <td data-label="Service" className="branchContainerTd">
      <img src={check} className='branchContainerIconMapStyle' alt="check"/>
        <h1 className='branchContainerBranchName'>
      Assure high quality and reliable products.
         </h1>
      </td>
    </tr>
  </tbody>
</table>
</div>

<div className='vissionContainer'>
<h1 className='brandVissionHeader'>VISION</h1> 
<img src={truckPhilippines} className='branchVissionContainerIconStyle' alt="truckPhilippines"/>
<h1 className='branchVissionDetais'>
      To be the leading Filipino-owned truck and heavy equipment importer, distributor and assembler in the Philippine market.
         </h1>
</div>

      <video
        autoPlay
        controls
        loop
        muted
        className='brandContainer'
     >
        <source src={IntroAncarmotors} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Brand;
