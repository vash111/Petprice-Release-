import React from 'react';
import './styles/Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 로고 및 간단한 소개 */}
        <div className="footer-section about">
          <h3>PETPRICE</h3>
          <p>유기견에게 따뜻한 집을, 당신에게 특별한 친구를 연결합니다.</p>
        </div>

        {/* 사이트 네비게이션 */}
        <div className="footer-section navigation">
          <h4>카테고리</h4>

          <a href="/AboutPage" className="footer-link" style={{ display: 'block' }}>About Us</a>
          <a href="/services" className="footer-link" style={{ display: 'block' }}>Services</a>
          <a href="/volunteer" className="footer-link" style={{ display: 'block' }}>Volunteer</a>
          <a href="/contact" className="footer-link" style={{ display: 'block' }}>Contact</a>


        </div>

        {/* 연락처 */}
        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:info@yourwebsite.com" className="footer-link">petprice@petprice.com</a></p>
          <p>고객센터: <a href="tel:+1234567890" className="footer-link">031-1234-1234</a></p>
        </div>

        {/* 소셜 미디어 */}
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* 저작권 정보 */}
      <div className="footer-bottom">
        <p>© 2024 PETPRICE. All rights reserved.</p>
        <p>
          <a href="#privacy-policy" className="footer-link">Privacy Policy</a> |
          <a href="#terms" className="footer-link"> Terms of Service</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
