import React from 'react';
import './Branches.css'
import Footer from '../Footer';
import { GrMapLocation } from "react-icons/gr";
import { Link } from 'react-router-dom';


const Branches = () => {
  
  return (
    <div className='branchesContainer'>

<div className='branchesContainerTitle'>
            <h1 className='branchesContentHeader'>ANCAR MOTORS BRANCHES</h1>
            <p className='branchesContentDetails'>OUR NEAREST LOCATION IS AVAILABLE TO SERVE YOU QUICKLY.</p>
          </div>

            <table className="branchesTableContainer">
  <tbody>
    <tr>
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/hZCGNBBkdABkS6zY8' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
        <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>QUEZON</span>
        <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d3859.9753729908025!2d121.01558447487041!3d14.657339075685474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3397b6ee2f6581e9%3A0x3425b59a3e17bae3!2sGround%20Floor%2C%20Ancar%20Motors%2C%20Inc.%2C%20Azure%20Business%20Center%2C%201197-A%20Epifanio%20de%20los%20Santos%20Ave%2C%20Quezon%20City%2C%201105%20Metro%20Manila!3m2!1d14.6573028!2d121.0181599!5e0!3m2!1sen!2sph!4v1724289921514!5m2!1sen!2sph"
       className='branchesContentIframe'
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
        </a>
      </td>
  
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/H6UgJ4kpfgQFWajt9' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
      <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>TULLAHAN</span>
       <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d3859.525365272581!2d121.0050154748708!3d14.68285637505793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3397b6b6f5164da1%3A0x205780cf56317568!2sAncar%20Motors%2C%2014%20Tullahan%20Rd%2C%20Caloocan%2C%201402%20Metro%20Manila!3m2!1d14.6828512!2d121.0075904!5e0!3m2!1sen!2sph!4v1724291972884!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
          </a>
      </td>
    
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/VQfTAHh7DcdzWTcF8' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
      <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>CALASIAO</span>
        <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d3834.87333593996!2d120.35186698404334!3d16.020107859332303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x339142b64a510e21%3A0x89e2837b1d71397b!2sAncar%20Motors%2C%20Judge%20Jose%20de%20Venecia%20Avenue%2C%20Calasiao%2C%20Pangasinan!3m2!1d16.0214632!2d120.3520291!5e0!3m2!1sen!2sph!4v1724292075208!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
                </a>
      </td>
    </tr>
  </tbody>
</table>


<table className="branchesTableContainer">
  <tbody>
    <tr>
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/B6kBvAvcfnaMwem8A'target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
        <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>ISABELA</span>
       <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61145.710497552536!2d121.54199633042646!3d16.69654303798469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x33900719f42dbd09%3A0x6d1c232b32366fce!2sAncar%20Motors%20Inc%2C%201%2C%20Santiago%2C%20Isabela!3m2!1d16.6965137!2d121.5832015!5e0!3m2!1sen!2sph!4v1724292145586!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
        </a>
      </td>
  
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/3KYSoBQzYe5j8V7w6' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
      <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>URDANETA</span>
      
<iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61377.685933139895!2d120.53436082687351!3d15.955872811117676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x33913efd0d7e3c67%3A0x83be0ec76cf2c0f9!2sANCAR%20MOTORS%2C%20Urdaneta%2C%20Pangasinan!3m2!1d15.9557942!2d120.5755607!5e0!3m2!1sen!2sph!4v1724292306301!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
          </a>
      </td>
    
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/JLx8BSu6wddxe1ij6' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
      <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>TARLAC</span>
       <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61528.875853547186!2d120.5585881245785!3d15.454564925017106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3396c7fd210dd675%3A0xd662586099fe9e5b!2sAncar%20Motors%20Tarlac%2C%20Tarlac%20City%2C%20Tarlac!3m2!1d15.454486!2d120.59978799999999!5e0!3m2!1sen!2sph!4v1724292403930!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
                </a>
      </td>
    </tr>
  </tbody>
</table>
<table className="branchesTableContainer">
  <tbody>
    <tr>
      <td data-label="Service" className="branchesContainerTd">
      <Link to="/InventoryNav" className='branchesContentLinkContainer' >
        <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>LA TRINIDAD</span>
        <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d0.9341342937395144!2d120.59257554607376!3d16.464694833496583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x3391a367f2648ee7%3A0x12f910bf1d6e0088!2sFH7R%2BPQR%20D.%20G%20Pelayo%20fuel%20Station%2C%20Baguio%20-%20La%20Trinidad%20-%20Bontoc%20Rd%2C%20La%20Trinidad%2C%20Benguet!3m2!1d16.4643384!2d120.591915!5e0!3m2!1sen!2sph!4v1745392428333!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         {/* Our location to La Trinidad is temporarily unavailable. We will endeavour to update our information as soon as possible. */}
         </h1>
        </Link>
      </td>
  
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/sqpXYeCsDxpg3V226' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
      <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>TRUCKMART</span>
       <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61752.38488325889!2d120.96639052121971!3d14.682930598066857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x3397b6b6f5164da1%3A0x205780cf56317568!2sAncar%20Motors%2C%20Tullahan%20Road%2C%20Caloocan%2C%20Metro%20Manila!3m2!1d14.6828512!2d121.0075904!5e0!3m2!1sen!2sph!4v1724292768115!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
          </a>
      </td>
    
      <td data-label="Service" className="branchesContainerTd">
      <a href='https://maps.app.goo.gl/9LkF4wa1vj9CRUPp8' target='_blank' rel="noreferrer"  className='branchesContentLinkContainer'>
      <GrMapLocation  className='branchesContainerIconMapStyle'/>
        <h1 className='branchesContainerBranchName'>
        <span className='branchesContentHeaderTagName branchesContentHeaderTagTitle'>LA UNION</span>
      <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d61144.047054218674!2d120.29837303045205!3d16.701738834626568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e9!4m0!4m5!1s0x33918d11799211bb%3A0x89c45fe3c0295712!2sAncar%20Motors%20Inc.%2C%20Bacnotan%2C%20La%20Union!3m2!1d16.7016706!2d120.3395395!5e0!3m2!1sen!2sph!4v1724292811531!5m2!1sen!2sph"
        className='branchesContentIframe' 
         style={{ border: 0,paddingTop:20,paddingBottom:20}}
         allowFullScreen="" 
         loading="lazy" 
         referrerPolicy="no-referrer-when-downgrade"
         title="Google Maps Location"
         ></iframe>
         </h1>
                </a>
      </td>
    </tr>
  </tbody>
</table>



<Footer />
    </div>
  );
};

export default Branches;
