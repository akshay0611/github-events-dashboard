import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import UserInputForm from './components/UserInputForm';
import TrendingRepos from './components/TrendingRepos';
import RecommendedForYou from './components/RecommendedForYou';
import Footer from './components/Footer';
import UserProfile from './components/UserProfile'; // Import the UserProfile component
import './App.css';
import { FaSearch } from 'react-icons/fa';

function App() {
  const [unifiedSearchQuery, setUnifiedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ repositories: [], users: [] });
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const searchBoxRef = useRef(null);
  const commonSearchInputRef = useRef(null);
  const navigate = useNavigate(); // To programmatically navigate

  const toggleSearchBox = () => {
    setIsSearchBoxVisible((prev) => {
      if (prev) {
        setUnifiedSearchQuery('');
        setSearchResults({ repositories: [], users: [] });
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (isSearchBoxVisible && commonSearchInputRef.current) {
      commonSearchInputRef.current.focus();
    }
  }, [isSearchBoxVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsSearchBoxVisible(false);
        setUnifiedSearchQuery('');
        setSearchResults({ repositories: [], users: [] });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (unifiedSearchQuery.length < 3) {
        setSearchResults({ repositories: [], users: [] });
        return;
      }

      try {
        const [repoResponse, userResponse] = await Promise.all([
          fetch(`https://api.github.com/search/repositories?q=${unifiedSearchQuery}+in:name,description`),
          fetch(`https://api.github.com/search/users?q=${unifiedSearchQuery}`),
        ]);

        const repoData = await repoResponse.json();
        const userData = await userResponse.json();

        setSearchResults({
          repositories: repoData.items?.slice(0, 5) || [],
          users: userData.items?.slice(0, 5) || [],
        });
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults({ repositories: [], users: [] });
      }
    };

    const debounceTimeout = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(debounceTimeout);
  }, [unifiedSearchQuery]);

  return (
    <div className="App bg-gray-900 text-white min-h-screen">
      <Header toggleSearchBox={toggleSearchBox} />

      {isSearchBoxVisible && <div className="overlay" />}

      <main className="p-8">
        <UserInputForm toggleSearchBox={toggleSearchBox} isSearchBoxVisible={isSearchBoxVisible} />

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
            {searchResults.repositories?.length > 0 || searchResults.users?.length > 0 ? (
              <div className="search-results">
                {searchResults.users.length > 0 && (
                  <div className="search-users">
                    <h4 className="section-title">Users</h4>
                    {searchResults.users.map((user) => (
                      <div key={user.id} className="result-item">
                        <img src={user.avatar_url} alt={user.login} className="avatar" />
                        <button
                          onClick={() => navigate(`/user/${user.login}`)} // Navigate to UserProfile
                          className="user-link"
                        >
                          @{user.login}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.repositories.length > 0 && (
                  <div className="search-repositories">
                    <h4 className="section-title">Repositories</h4>
                    {searchResults.repositories.map((repo) => (
                      <div key={repo.id} className="result-item">
                        <div className="repo-info">
                          <a
                            href={repo.owner.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="owner-avatar-container"
                          >
                            <img
                              src={repo.owner.avatar_url}
                              alt={repo.owner.login}
                              className="owner-avatar"
                            />
                          </a>
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.full_name}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              unifiedSearchQuery.length > 2 && <p className="no-results-message">No results found</p>
            )}
          </div>
        )}

        <TrendingRepos />
        <RecommendedForYou />
      </main>

      <Footer />
    </div>
  );
}

function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/user/:username" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default Root;
