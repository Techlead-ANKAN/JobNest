// import React from "react";
// import Logo from "../../public/logo.jpg";
// import { Link } from "react-router-dom";
// import "./LandingPage.css"

// function LandingPage() {
//   return (
//     <main className="flex flex-col gap-10 sm:gap-20 py-10 sm:py-20">
//       <section className="text-center">
//         <h1 className="flex flex-col items-center justify-center gradient-title">
//           find Your Dream Job{" "}
//           <span>
//             and get Hired{" "}
//             <img src={Logo} alt="Logo" className="h-14 sm:h-24 lg:h-32"></img>
//           </span>
//         </h1>

//         <p>
//           Explore thousands of job listings or find the perfect candidate
//         </p>
//       </section>

//       <div>
//         <Link to="/job">
//           <Button>Find Jobs</Button>
//         </Link>

//         <Link to="/postjobs">
//           <Button>Post Jobs</Button>
//         </Link>
//       </div>

//         {/* carousel showing pictures of companies from companiesData.json */}

//         {/* banner image */}

//         {/* faq questions to be shown from the faq.json */}



//       <div></div>
//     </main>
//   );
// }

// export default LandingPage;













import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../public/logo.png";
import companiesData from "../data/companiesData.json";
import faqData from "../data/faq.json";
import "./LandingPage.css";

function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <main className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="logo-container">
            <img src={Logo} alt="CareerConnect" className="logo" />
          </div>
          <h1 className="hero-title">
            Find Your <span className="highlight">Dream Job</span>
            <br />
            <span className="sub-title">Hire Exceptional Talent</span>
          </h1>
          <p className="hero-text">
            Connect with top companies or discover perfect candidates -
            Your career transformation starts here
          </p>
          <div className="cta-buttons">
            <Link to="/job" className="cta-button primary">
              Find Jobs
            </Link>
            <Link to="/postjobs" className="cta-button secondary">
              Post Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Companies Carousel */}
      <section className="trusted-companies">
        <h3 className="section-title">Trusted by Leading Companies</h3>
        <div className="marquee-container">
          <div className="marquee-content">
            {companiesData.map((company) => (
              <img
                key={company.id}
                src={company.path}
                alt={company.name}
                className="company-logo"
                loading="lazy"
              />
            ))}
            {companiesData.map((company) => (
              <img
                key={`dup-${company.id}`}
                src={company.path}
                alt={company.name}
                className="company-logo"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="features-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">
              Transform Your Career Journey
            </h2>
            <p className="banner-description">
              Smart matching algorithm • Real-time applications •
              Candidate verification • AI-powered insights
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h3 className="section-title">Frequently Asked Questions</h3>
        <div className="faq-container">
          {faqData.faq.map((item, index) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h4>{item.question}</h4>
                <span className="toggle-icon">{activeIndex === index ? '-' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LandingPage;