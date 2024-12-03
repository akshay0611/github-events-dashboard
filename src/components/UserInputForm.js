import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './UserInputForm.css'; 

const UserInputForm = ({ searchQuery, setSearchQuery, toggleSearchBox }) => {
  return (
    <section className="user-input-section">
      <div className="form-container">
        <h1 className="form-title">
          Explore <span className="highlight-text">Open Source</span>
        </h1>
        <form className="form">
          <div className="input-container" onClick={toggleSearchBox}>
            <input
              type="text"
              placeholder="Users, Repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
            <FaSearch className="user-input-search-icon" aria-label="Search" size={20} />
          </div>
        </form>
      </div>
    </section>
  );
};

export default UserInputForm;
