// src/components/RecommendedForYou.js
import React from 'react';
import { FaGithub } from 'react-icons/fa';
import './RecommendedForYou.css'; // Import the styles

const RecommendedForYou = () => {
  return (
    <section className="recommended-for-you">
      <h2 className="recommended-title">Recommended for You</h2>
      <p className="recommendation-message">
        Log in to get personalized recommendations on repositories to contribute to!
      </p>
      <button
  className="github-button"
  onClick={() => {
    window.location.href = 'http://localhost:4000/auth/github';
  }}
>
  <FaGithub className="github-icon" />
  <span>Connect with GitHub</span>
</button>
    </section>
  );
};

export default RecommendedForYou;
