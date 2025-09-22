import React from 'react';
import './TermandCondition.css'
const TermandCondition = () => {

  return (
    <div className="policies-container">
      <section className="terms-section">
        <h1 className='TCHeader'>Terms and Conditions</h1>
        <h2 className='TCNumber'>1. Introduction</h2>
        <p className='TCParagrahp'>
          These Terms and Conditions ("Terms") govern your use of our website and services provided by Ancar Motors Inc. 2025 ("we", "us", or "our"). By accessing and using our website and services, you agree to be bound by these Terms.
        </p>
        <h2 className='TCNumber'>2. Acceptance</h2>
        <p className='TCParagrahp'>
          By accessing and using our website and services, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these Terms, you must not use our website or services.
        </p>
        <h2 className='TCNumber'>3. Use of Website</h2>
        <p className='TCParagrahp'>
          You may only use our website and services for lawful purposes. You agree not to:
        </p>
         <ul className='TCUL'>
           <li className='TCLI'>Use our website or services in a way that could damage, disable, or impair our systems or network;</li>
           <li className='TCLI'>Attempt to gain unauthorized access to our systems or network;</li>
           <li className='TCLI'>Use our website or services for any illegal or unauthorized purpose;</li>
           <li className='TCLI'>Engage in any activity that is harmful to our reputation or goodwill;</li>
           <li className='TCLI'>Use our website or services in a way that is fraudulent or misleading.</li>
        </ul>
        <h2 className='TCNumber'>4. Content</h2>
        <p className='TCParagrahp'>
          All content on our website, including but not limited to text, images, audio, video, and software, is the property of Ancar Motors Inc. 2025 and is protected by copyright and other intellectual property laws.
        </p>
        <h2 className='TCNumber'>5. Trademarks</h2>
        <p className='TCParagrahp'>
        Ancar Motors Inc. 2025 is a registered trademark of Ancar Motors Inc. 2025. You are not permitted to use our trademark without our prior written consent.
        </p>
        <h2 className='TCNumber'>6. Liability</h2>
        <p className='TCParagrahp'>
          We will not be liable for any damages or losses (including but not limited to consequential, incidental, special, punitive, or exemplary damages) arising out of your use of our website or services.
        </p>
        <h2 className='TCNumber'>7. Governing Law</h2>
        <p className='TCParagrahp'>
        These Terms will be governed by and construed in accordance with the laws of the Philippines. Any disputes arising out of these Terms will be resolved through binding arbitration in accordance with the rules of the Philippine Dispute Resolution Center, Inc. (PDRCI).
        </p>
        <h2 className='TCNumber'>8. Changes to Terms</h2>
        <p className='TCParagrahp'>
          We reserve the right to change these Terms at any time without notice. You are responsible for regularly reviewing these Terms to ensure that you are aware of any changes.
        </p>
        <h2 className='TCNumber'>9. Contact Us</h2>
        <p className='TCParagrahp'>
          If you have any questions or concerns about these Terms, please contact us at  <a href="mailto:Tech.Support@ancar.com.ph?subject=Questions%20About%20Terms" target="_blank" rel="noopener noreferrer">
        Tech.Support@ancar.com.ph
      </a>
        </p>
        <h2 className='TCNumber'>10. Entire Agreement</h2>
        <p className='TCParagrahp'>
          These Terms constitute the entire agreement between you and us regarding your use of our website and services.
        </p>
      </section>

      <section className="privacy-section">
        <h1  className='TCHeader'>Privacy Policy</h1>
        <h2 className='TCNumber'>1. Introduction</h2>
        <p className='TCParagrahp'>
          We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you interact with our website and services.
        </p>
        <h2 className='TCNumber'>2. Personal Information</h2>
        <p className='TCParagrahp'>
          We collect personal information such as your name, email address, phone number, and physical address.
        </p>
        <h2 className='TCNumber'>3. Cookies</h2>
        <p className='TCParagrahp'>
          We use cookies to track your browsing behavior and preferences.
        </p>
        <h2 className='TCNumber'>4. Usage Data</h2>
        <p className='TCParagrahp'>
          We collect usage data such as the pages you visit, the links you click, and the actions you take on our website and services.
        </p>
        <h2 className='TCNumber'>5. Disclosure</h2>
        <p className='TCParagrahp'>
          We may disclose your personal information to third parties as required by law or in response to a court order.
        </p>
        <h2 className='TCNumber'>6. Security</h2>
        <p className='TCParagrahp'>
          We take reasonable measures to protect your personal information from unauthorized access, use, disclosure, modification, or destruction.
        </p>
        <h2 className='TCNumber'>7. Opt-Out</h2>
        <p className='TCParagrahp'>
          You have the right to opt-out of receiving marketing communications from us at any time.
        </p>
        <h2 className='TCNumber'>8. Changes to Policy</h2>
        <p className='TCParagrahp'>
          We reserve the right to change this Privacy Policy at any time without notice. You are responsible for regularly reviewing this Privacy Policy to ensure that you are aware of any changes.
        </p>
      </section>
    </div>
  );
};

export default TermandCondition;