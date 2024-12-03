import React from 'react';
import { FaGithub, FaSearch } from 'react-icons/fa';
import './Header.css'; 

const Header = ({ toggleSearchBox, isSearchBoxVisible }) => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Left Section */}
        <div className="header-left">
          <a href="/" className="logo-link">
            <img src="/logo.webp" alt="Logo" className="logo" />
            <h1 className="site-title">GitTrack</h1>
          </a>
          <a href="#explore" className="explore-link">
            Explore
          </a>
        </div>

        {/* Right Section */}
        <div className="header-right">
          <div 
            className="search-container" 
            onClick={!isSearchBoxVisible ? toggleSearchBox : undefined} // Trigger only when the common search box is not visible
          >
            <input
              type="text"
              placeholder="Users, Repositories..."
              className={`search-input ${
                isSearchBoxVisible ? 'input-inactive' : 'input-active'
              }`}
              readOnly // Prevent typing in the input field
            />
            <span className="header-search-icon">
              <FaSearch />
            </span>
          </div>

          <button
  className="github-button"
  onClick={() => {
    window.location.href = 'http://localhost:4000/auth/github';
  }}
>
  <FaGithub className="github-icon" />
  <span>Connect with GitHub</span>
</button>

        </div>
      </div>
    </header>
  );
};

export default Header;
