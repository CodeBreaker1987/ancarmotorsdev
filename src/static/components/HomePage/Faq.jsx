import React from 'react';
import './Faq.css';
import { Link } from 'react-router-dom';

const Faq = () => {
  return (
    <div id="Faq" className='parallaxFaq'>
      <h1 className='faqHeader'>FREQUENTLY ASKED QUESTIONS (FAQ's)</h1>
      <div className='faqContainer'>
      <Link to="/Branches"><button className='faqName'>BRANCHES/CAREERS</button></Link>
      <Link to="/FaqContentNav"><button className='faqName'>CONTACT/HISTORY</button></Link>
      </div>
    </div>
  );
}

export default Faq;