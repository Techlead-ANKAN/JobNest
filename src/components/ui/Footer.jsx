import React, { useState } from 'react';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('mr.ankanmaity@gmail.com');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-heading">Contact Developer</h4>
          <div className="developer-info">
            <span className="developer-name">Techlead-ANKAN</span>
            <div className="social-links">
              <a 
                href="https://github.com/Techlead-ANKAN" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FiGithub className="social-icon" />
              </a>
              <a
                href="https://www.linkedin.com/in/ankan-maity"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="social-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <div className="email-container" onClick={copyToClipboard}>
            <FiMail className="email-icon" />
            <span className="email-text">mr.ankanmaity@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="copyright">
        © {new Date().getFullYear()} JobNest. All rights reserved.
      </div>

      {showCopied && <div className="copy-notification">Copied to clipboard!</div>}
    </footer>
  );
};

export default Footer;