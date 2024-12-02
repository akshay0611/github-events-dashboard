import React, { useState } from 'react';
import ErrorPage from './components/ErrorPage';
import { FaGithub } from "react-icons/fa";
import { FaSearch } from 'react-icons/fa';  

function App() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [mainSearch, setMainSearch] = useState('');
  const [error, setError] = useState(null); 

  if (error) {
    // Show the ErrorPage component if there's an error
    return <ErrorPage errorMessage={error} />;
  }

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
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center mt-12">
        <p>© 2024 GitTrack | Built with ❤️ by Akshay Kumar</p>
      </footer>
    </div>
  );
}

export default App;