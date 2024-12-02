import React, { useState, useEffect } from 'react';  // Added useEffect import
import ErrorPage from './components/ErrorPage';
import { FaGithub, FaSearch, FaStar, FaRegCheckCircle, FaUsers, FaExclamationCircle, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import axios from 'axios';  // Import Axios

function App() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [mainSearch, setMainSearch] = useState('');
  const [error, setError] = useState(null); 

  return (
    <div className="App bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2 no-hover">
              <img src="/logo.webp" alt="Logo" className="h-10 w-auto" />
              <h1 className="text-xl font-bold">GitTrack</h1>
            </a>
            <a href="#explore" className="text-gray-300 hover:text-blue-500 focus:text-blue-500 text-sm">
              Explore
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Users, Repositories..."
                value={headerSearch} // Bind header search input to headerSearch state
                onChange={(e) => setHeaderSearch(e.target.value)} // Update headerSearch state
                className={`px-10 py-1 text-sm ${headerSearch ? 'text-white' : 'text-gray-900'} rounded-md focus:outline-none focus:ring focus:ring-gray-500`}
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaSearch className="h-5 w-5" />
              </span>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
              <FaGithub className="h-5 w-5" />
              <span>Connect with GitHub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* User Input Form */}
        <section className="w-full flex items-center justify-center bg-transparent">
          <div className="form-container">
            <h1 className="form-title">
              Explore <span className="text-orange-500">Open Source</span>
            </h1>
            <form className="form flex items-center space-x-2 shadow-md transition-all ease-in-out duration-200">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Users, Repositories..."
                  value={mainSearch} // Bind main search input to mainSearch state
                  onChange={(e) => setMainSearch(e.target.value)} // Update mainSearch state
                  className="form-input"
                />
                <FaSearch className="search-icon" aria-label="Search" size={20} />
              </div>
            </form>
          </div>
        </section>

        {/* Trending Repositories Section */}
        <TrendingRepos />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center mt-12">
        <p>© 2024 GitTrack | Built with ❤️ by Akshay Kumar</p>
      </footer>
    </div>
  );
}

const TrendingRepos = () => {
  const [repos, setRepos] = useState([]);  // State for storing the fetched repositories
  const [currentRepoIndex, setCurrentRepoIndex] = useState(0); // To track the current index
  const [loading, setLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null); // To handle errors
  
  const reposPerPage = 3;  // Display 3 repositories at a time
  const totalRepos = repos.length;

  useEffect(() => {
    // Fetch data from the API
    const fetchRepos = async () => {
      try {
        const response = await axios.get('https://api.github.com/search/repositories', {
          params: {
            q: 'stars:>800', // Query to fetch repositories with more than 1 star
            sort: 'stars', // Sort by stars to get trending repos
            order: 'desc', // Descending order (most stars first)
          }
        });
        setRepos(response.data.items);  // Use the 'items' key which contains the repositories
        setLoading(false);
      } catch (error) {
        setError('Failed to load repositories');
        setLoading(false);
      }
    };

    fetchRepos();  // Call the function to fetch repos
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

  // Slice the repos array to get the current 3 repositories to display
  const currentRepos = repos.slice(currentRepoIndex, currentRepoIndex + reposPerPage);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // Show the ErrorPage component if there's an error
    return <ErrorPage errorMessage={error} />;
  }

  return (
    <section className="trending-repos-section">
      <h2 className="trending-repos-title text-3xl font-bold text-center mb-8">Trending Repositories</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRepos.map((repo, index) => (
          <div key={index} className="trending-repo-card bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <h3 className="repo-name text-2xl font-semibold text-white">{repo.name}</h3>
            <p className="repo-description text-sm text-gray-400 mt-2">{repo.description}</p>

            <div className="repo-stats flex justify-between items-center mt-4">
              <div className="flex space-x-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400" />
                  <span className="ml-1">{repo.stars} stars</span>
                </div>
                <div className="flex items-center">
                  <FaExclamationCircle className="text-red-500" />
                  <span className="ml-1">{repo.open_issues} issues</span>
                </div>
                <div className="flex items-center">
                  <FaRegCheckCircle className="text-green-500" />
                  <span className="ml-1">{repo.pull_requests} PRs</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-blue-500" />
                  <span className="ml-1">{repo.contributors} contributors</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <a href={repo.html_url} className="text-blue-500 hover:underline text-sm">
                View Repo
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="nav-buttons-container">
        <button onClick={handlePrevious} disabled={currentRepoIndex === 0} className="nav-button">
          <FaChevronLeft />
        </button>
        <button onClick={handleNext} disabled={currentRepoIndex + reposPerPage >= totalRepos} className="nav-button">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default App; 