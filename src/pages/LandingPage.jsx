import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../../public/logo.png";
import companiesData from "../data/companiesData.json";
import faqData from "../data/faq.json";
import "./LandingPage.css";
import { useSignIn, useUser  } from "@clerk/clerk-react";
import SignInModal from "@/components/ui/SignInModal";

function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [autoCloseModal, setAutoCloseModal] = useState(false);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const { isSignedIn, isLoaded } = useUser ();
  const { signIn } = useSignIn();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setShowModal(true);
      setAutoCloseModal(true);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (autoCloseModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        setAutoCloseModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoCloseModal]);

  const handleProtectedNavigation = (path) => (e) => {
    if (isLoaded && !isSignedIn) {
      e.preventDefault();
      setShowModal(true);
    }
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
            Connect with top companies or discover perfect candidates - Your
            career transformation starts here
          </p>
          <div className="cta-buttons">
            <Link
              to="/job"
              className="cta-button primary"
              onClick={handleProtectedNavigation("/job")}
            >
              Find Jobs
            </Link>
            <Link
              to="/postjobs"
              className="cta-button secondary"
              onClick={handleProtectedNavigation("/postjobs")}
            >
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
            <h2 className="banner-title">Transform Your Career Journey</h2>
            <p className="banner-description">
              Smart matching algorithm • Real-time applications • Candidate
              verification • AI-powered insights
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
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h4>{item.question}</h4>
                <span className="toggle-icon">
                  {activeIndex === index ? "-" : "+"}
                </span>
              </div>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal && <SignInModal data={[showModal, setShowModal]} />}
    </main>
  );
}

export default LandingPage;