import React from 'react';
import './Footer.css';
import { FaFacebookF } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useUser } from '../Context/UserContext.jsx'; // ✅ import user context

const Faq = () => {
  const { user } = useUser();

  // ❌ hide footer for admins
  if (user?.role === "admin") {
    return null;
  }

  return (
    <div id="Faq" className='parallaxFooter'>
      <div className='footerContainer'>
        <span className='footerIconContainer'>
          <a href='https://www.facebook.com/ancarmotorsmrktng/' target="_blank" rel="noopener noreferrer">
            <FaFacebookF className='footerName'/>
          </a>
          <a href='https://www.tiktok.com/@ancarmotorsinc' target="_blank" rel="noopener noreferrer">
            <FaTiktok className='footerName'/>
          </a>
          <a href='https://www.youtube.com' target="_blank" rel="noopener noreferrer">
            <FaYoutube className='footerName'/>
          </a>
        </span>
        <a 
          href="mailto:Tech.Support@ancar.com.ph?subject=IT%20Department%20Website%20Message" 
          target="_blank" 
          rel="noopener noreferrer"
          className='footerCreatedByHref'
        >
          <h1 className='footerCreatedBy'>Developed by IT Department</h1>
        </a>
      </div>

      <div className='footerRights'>
        <p className="footerInfo">
          <strong className="footerInfoBold">© ANCAR MOTORS INC. 2025</strong> | All Right Reserve. - 
          <strong><Link className='footerInfoBold' to="/TermandCondition"> PRIVACY POLICY </Link></strong>
        </p>
      </div>
    </div>
  );
}

export default Faq;
