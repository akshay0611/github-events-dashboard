import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaStar, FaCodeBranch, FaExclamationCircle} from 'react-icons/fa';
import axios from 'axios';
import ErrorPage from './ErrorPage';
import './TrendingRepos.css'; 

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

        const reposWithPRs = await Promise.all(response.data.items.map(async (repo) => {
          // Fetch the open pull requests count for each repository
          const prResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/pulls`, {
            params: {
              state: 'open',
            },
          });

          return {
            ...repo,
            pullRequestCount: prResponse.data.length, // Add the pull request count to the repo data
          };
        }));

        setRepos(reposWithPRs || []);
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
    <a
      href={repo.html_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="detailed-repo-card"
      key={repo.id}
    >
      <div className="repo-top">
        <img 
          src={repo.owner.avatar_url} 
          alt={repo.owner.login} 
          className="repo-avatar"
        />
        <span className="repo-username">{repo.owner.login}</span>
      </div>
      <div className="repo-name">{repo.name}</div>
      <div className="repo-description">{repo.description}</div>
      <div className="repo-stats">
        {/* Stars */}
        <div className="repo-stat">
          <FaStar className="repo-stat-icon" />
          <span>{repo.stargazers_count}</span>
        </div>
        {/* Forks */}
        <div className="repo-stat">
          <FaCodeBranch className="repo-stat-icon" />
          <span>{repo.forks_count}</span>
        </div>
        {/* Pull Requests */}
        <div className="repo-stat">
          <FaCodeBranch className="repo-stat-icon" />
          <span>{repo.pullRequestCount} Open PRs</span>
        </div>
        {/* Issues */}
        <div className="repo-stat">
          <FaExclamationCircle className="repo-stat-icon" />
          <span>{repo.open_issues_count} Issues</span>
        </div>
      </div>
    </a>
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
