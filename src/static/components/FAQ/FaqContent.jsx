import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './FaqContent.css'
// import { MdWorkspacePremium } from "react-icons/md";
import { MdTravelExplore } from "react-icons/md";
import { GiPayMoney } from "react-icons/gi";
import { FiTruck } from "react-icons/fi";
import { Link } from 'react-router-dom';


const Faq = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Custom email validation function
  const validateEmail = (email) => {
    // Define a regex pattern for email format validation with specific domain endings
    const emailPattern = /^[^\s@]+@[^\s@]+\.(com|ph|net|com\.ph|org|biz|edu|gov|mil|name|co)$/i;
    return emailPattern.test(email);
  };
  // Updated phone number validation function
  const validatePhoneNumber = (phone) => {
    const phonePattern = /^(?:\+63\d{10}|\b09\d{9})$/;
    return phonePattern.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Validate email and phone number
    if (!validateEmail(formData.email)) {
      setErrorMessage('Invalid email address.');
      return;
    }
  
    if (!validatePhoneNumber(formData.phone)) {
      setErrorMessage('Invalid phone number format.');
      return;
    }
  
    // Check for duplicate messages
    const currentTimestamp = new Date().getTime();
    const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
  
    // Retrieve previously sent messages from local storage
    const sentMessages = JSON.parse(localStorage.getItem('sentMessages')) || [];
  

    const isDuplicate = sentMessages.some(message => {
      return   message.email === formData.email &&
            //  message.message === formData.message && message.name === formData.name &&
            //  message.phone === formData.phone &&
            //  message.message === formData.message &&
             (currentTimestamp - message.timestamp < twentyFourHoursInMillis);
    });
  
    if (isDuplicate) {
      const errorMessage = 'You can send only one message per email address every 24 hours. Please use a different email address or contact us via phone.';
    setErrorMessage(errorMessage);
    alert(errorMessage); 
    setSuccessMessage('')
      return;
    }
  
    // Send the email via EmailJS
    emailjs.sendForm('service_cj3pw2d', 'template_lo3zhak', e.target, 'I_wDrhBau1kAH8GYR')
      .then((result) => {
        // Store the message details in local storage
        const newMessage = {
          // name: formData.name,
           email: formData.email,
          // phone: formData.phone,
          //message: formData.message,
          timestamp: currentTimestamp,
        };
  
        sentMessages.push(newMessage);
        localStorage.setItem('sentMessages', JSON.stringify(sentMessages));
  
        setSuccessMessage('Message sent successfully!');
        setErrorMessage('');
        setTimeout(() => {
          setSuccessMessage('');
      }, 10000); 
        // Reset the form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    setSuccessMessage('');
      }, (error) => {
        setErrorMessage('Failed to send message. Please try again later.');
        setSuccessMessage('');
      });
     
  };
  return (
    <div className='faqContentInventory'>

<div className='faqContentContainer'>
            <h1 className='faqContentHeader'>FREQUENTLY ASKED QUESTIONS (FAQ's)</h1>
            <p className='faqContentDetails'>HOW TO CHOOSE THE RIGHT TRUCK FOR YOUR BUSINESS NEEDS.</p>
          </div>


            <table className="faqContentTruckTable">
  <tbody>
    <tr>
      <td data-label="Service" className="faqContentContainerTd">
      <Link to="/InventoryNav" className='faqContentLinkContainer' >
        <FiTruck className='faqContentTruckStyle'/>
        <h1 className='faqContentHeaderTagName'>CONVENIENT</h1>
        <h1 className='faqContentTruckName'>
        <span className='faqContentHeaderTagName faqContentHeaderTagTitle'>What is ANCAR MOTORS INC. industry?</span>
        ANCAR MOTORS INC. is in the industry of Motor Vehicle and Motor Vehicle Parts and Supplies Merchant Wholesalers</h1>
        </Link>
      </td>
  
      <td data-label="Service" className="faqContentContainerTd">
      <a href='https://maps.app.goo.gl/hZCGNBBkdABkS6zY8' target='_blank' rel="noreferrer"  className='faqContentLinkContainer'>
      <MdTravelExplore className='faqContentTruckStyle'/>
        <h1 className='faqContentHeaderTagName'>EXPLORE</h1>
        <h1 className='faqContentTruckName'>
        <span className='faqContentHeaderTagName faqContentHeaderTagTitle'>Where is ANCAR MOTORS INC. located?</span>
          ANCAR MOTORS INC. is located at Ground Floor & 3rd Floor Azure Business Center 1197 Epifanio Delos Santos Avenue, Barangay Katipunan Quezon, Manila, 1105 Philippines</h1>
          </a>
      </td>
    
      <td data-label="Service" className="faqContentContainerTd">
      <a href='#faqContentContactForm' className='faqContentLinkContainer'>
      <GiPayMoney className='faqContentTruckStyle'/>
        <h1 className='faqContentHeaderTagName'>AFFORDABLE</h1>
        <h1 className='faqContentTruckName'>
        <span className='faqContentHeaderTagName faqContentHeaderTagTitle'>Ancar Motors Inc. Main Plant Showroom</span>
          Our inventory of trucks and heavy equipment will surely meet your requirement. We are willing to meet you at your most convenient time and place to discuss your needs. 
                Worry no more with the cost of purchase. 
                We can assist and arrange the most appropriate financing package for you through 
                our accreditation with leading banks and financing companies. 
                We can also provide assistance in securing the necessary insurance policy. 
                Be among the long list of our satisfied customers we have served for more than three decades.</h1>
                </a>
      </td>
    </tr>
  </tbody>
</table>

        
            <div className='faqContentContainerForm' id='faqContentContactForm'>
            <h1 className='faqContentHeaderForm'>CONTACT US ANYTIME</h1>
            <p className='faqContentDetailsForm'>We are always here to assist you. Feel free to contact us at any time with your questions, concerns, or requests. Whether you need support, additional information, or just want to discuss your needs, our team is ready and available to help. Don’t hesitate to reach out. We’re committed to providing you with the best service possible.</p>

      <form onSubmit={handleSubmit}>
        <label>
          <h1 className='faqContentLabelStyle'>Name <span className='faqContentLabelAsteriskStyle'>*</span></h1>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
              placeholder="Enter your name here..."
            className='faqContentFormInputStyle'
          />
        </label>
        <br />
        <label>
        <h1 className='faqContentLabelStyle'>Email <span className='faqContentLabelAsteriskStyle'>*</span></h1>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@example.com"
              className='faqContentFormInputStyle'
          />
        </label>
        <br />
        <label>
        <h1 className='faqContentLabelStyle'>Phone <span className='faqContentLabelAsteriskStyle'>*</span></h1>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+63 1234567890 or 09123456789"
              className='faqContentFormInputStyle'
          />
        </label>
        <br />
        <label>
          <h1 className='faqContentLabelStyle'>Message <span className='faqContentLabelAsteriskStyle'>*</span></h1>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
               placeholder="Please enter your message here..."
             className='faqContentFormInputMessageStyle'
          />
        </label>
        <br />
        <button type="submit"
        className='faqContentSubmitButtonStyle'
        >Submit</button>
      </form>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p className='faqContentErrorMessage'>{errorMessage}</p>}
    </div>
    </div>
  );
};

export default Faq;
