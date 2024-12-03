import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import UserInputForm from './components/UserInputForm';
import TrendingRepos from './components/TrendingRepos';
import RecommendedForYou from './components/RecommendedForYou';
import Footer from './components/Footer';
import './App.css';
import { FaSearch } from 'react-icons/fa';

function App() {
  const [unifiedSearchQuery, setUnifiedSearchQuery] = useState('');
  const [userInputSearchQuery, setUserInputSearchQuery] = useState('');
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const searchBoxRef = useRef(null);
  const commonSearchInputRef = useRef(null);

  const toggleSearchBox = () => {
    setIsSearchBoxVisible((prev) => {
      if (prev) {
        setUnifiedSearchQuery(''); // Clear the search query when closing the search box
      }
      return !prev;
    });
  };

  // Focus the common search box input when it becomes visible
  useEffect(() => {
    if (isSearchBoxVisible && commonSearchInputRef.current) {
      commonSearchInputRef.current.focus();
    }
  }, [isSearchBoxVisible]);

  // Detect clicks outside the search box to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsSearchBoxVisible(false);
        setUnifiedSearchQuery(''); // Clear the search query when clicking outside
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="App bg-gray-900 text-white min-h-screen">
      <Header 
        searchQuery={userInputSearchQuery} 
        setSearchQuery={setUserInputSearchQuery} 
        toggleSearchBox={toggleSearchBox}
      />

      {/* Full-screen overlay when search box is visible */}
      {isSearchBoxVisible && <div className="overlay" />}

      <main className="p-8">
        <UserInputForm 
          searchQuery={userInputSearchQuery} 
          setSearchQuery={setUserInputSearchQuery} 
          toggleSearchBox={toggleSearchBox}
          isSearchBoxVisible={isSearchBoxVisible} 
        />

        {isSearchBoxVisible && (
          <div className="common-search-box" ref={searchBoxRef}>
            <div className="search-icon-container">
              <FaSearch className="search-icon" />
            </div>
            <input
              type="text"
              placeholder="Search Users, Repositories..."
              value={unifiedSearchQuery}
              onChange={(e) => setUnifiedSearchQuery(e.target.value)}
              className="form-input"
              ref={commonSearchInputRef}
            />
          </div>
        )}

        <TrendingRepos />
        <RecommendedForYou />
      </main>

      <Footer />
    </div>
  );
}

export default App;
