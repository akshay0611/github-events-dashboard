import React from 'react';
import { FaGithub, FaSearch } from 'react-icons/fa';
import './Header.css'; 

const Header = ({ searchQuery, setSearchQuery, toggleSearchBox }) => {
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
          <div className="search-container" onClick={toggleSearchBox}>
            <input
              type="text"
              placeholder="Users, Repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`search-input ${
                searchQuery ? 'input-active' : 'input-inactive'
              }`}
            />
            <span className="header-search-icon">
              <FaSearch />
            </span>
          </div>

          <button className="github-button">
            <FaGithub className="github-icon" />
            <span>Connect with GitHub</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
