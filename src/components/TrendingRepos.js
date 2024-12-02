import React, { useState, useEffect } from 'react';
import { FaStar, FaExclamationCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import ErrorPage from './ErrorPage';
import './TrendingRepos.css'; // Import the custom CSS file

const TrendingRepos = () => {
  const [repos, setRepos] = useState([]);
  const [currentRepoIndex, setCurrentRepoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reposPerPage = 3;
  const totalRepos = repos.length;

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get('https://api.github.com/search/repositories', {
          params: {
            q: 'stars:>800',
            sort: 'stars',
            order: 'desc',
          },
        });
        setRepos(response.data.items || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load repositories');
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const handleNext = () => {
    if (currentRepoIndex + reposPerPage < totalRepos) {
      setCurrentRepoIndex(currentRepoIndex + reposPerPage);
    }
  };

  const handlePrevious = () => {
    if (currentRepoIndex - reposPerPage >= 0) {
      setCurrentRepoIndex(currentRepoIndex - reposPerPage);
    }
  };

  const currentRepos = repos.slice(currentRepoIndex, currentRepoIndex + reposPerPage);

  if (loading) return <div>Loading...</div>;

  if (error) return <ErrorPage errorMessage={error} />;

  return (
    <section className="trending-repos-section">
      <h2 className="trending-repos-title">Trending Repositories</h2>

      <div className="repo-cards-container">
        {currentRepos.map((repo) => (
          <div key={repo.id} className="trending-repo-card">
            <h3 className="repo-name">{repo.name}</h3>
            <p className="repo-description">{repo.description}</p>

            <div className="repo-stats">
              <div className="repo-stat">
                <FaStar className="repo-stat-icon" />
                <span>{repo.stargazers_count} stars</span>
              </div>
              <div className="repo-stat">
                <FaExclamationCircle className="repo-stat-icon" />
                <span>{repo.open_issues_count} issues</span>
              </div>
            </div>

            <div className="repo-link">
              <a href={repo.html_url}>View Repo</a>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-buttons">
        <button
          onClick={handlePrevious}
          disabled={currentRepoIndex === 0}
          className="pagination-button"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={handleNext}
          disabled={currentRepoIndex + reposPerPage >= totalRepos}
          className="pagination-button"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default TrendingRepos;
