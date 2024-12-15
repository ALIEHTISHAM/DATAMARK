// Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar" style={{
      position: 'sticky', // Makes the navbar fixed at the top

    }}>
      <div className="navbar-logo">
        <img src="logo.png" alt="Logo" />
      </div>
      <div className={`navbar-buttons ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="navbar-button">Home</Link>
        <Link to="/my-content" className="navbar-button">My Content</Link>
        <Link to="/royalties" className="navbar-button">Royalties</Link>
        <Link to="/services" className="navbar-button">Services</Link>

        <Link to="/login" className="navbar-button navbar-login-button">Login/Sign Up</Link>
      </div>
      <div className="navbar-menu-toggle" onClick={toggleMenu}>
        ☰
      </div>
    </nav>
  );
}

export default Navbar;
