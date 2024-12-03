import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './UserInputForm.css';

const UserInputForm = ({ toggleSearchBox, isSearchBoxVisible }) => {
  return (
    <section className="user-input-section">
      <div className="form-container">
        <h1 className="form-title">
          Explore <span className="highlight-text">Open Source</span>
        </h1>
        <form className="form">
          <div
            className="input-container"
            onClick={!isSearchBoxVisible ? toggleSearchBox : undefined} // Trigger toggleSearchBox only when the common search box is not visible
          >
            <input
              type="text"
              placeholder="Users, Repositories..."
              className="form-input"
              readOnly // Prevent typing in this input
            />
            <FaSearch className="user-input-search-icon" aria-label="Search" size={20} />
          </div>
        </form>
      </div>
    </section>
  );
};

export default UserInputForm;
