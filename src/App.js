import React, { useState, useEffect } from 'react';
import ErrorPage from './components/ErrorPage';
import { FaGithub } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

function App() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [popularRepos, setPopularRepos] = useState([]); 
  const [error, setError] = useState(null); 

  // Fetch GitHub Events
   const fetchGitHubEvents = async () => {
    if (username.trim()) {
      setLoading(true);
      setError(null); 
      try {
        const response = await fetch(`https://api.github.com/users/${username}/events`);
        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setEvents(data);
        setFilteredEvents(data);
        setIsFilterVisible(true);
      } catch (err) {
        console.error(err);
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    }
  };

// Fetch GitHub Profile Information
const fetchUserProfile = async () => {
  if (username.trim()) {
    setError(null); 
    try {
      const profileResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!profileResponse.ok) {
        throw new Error(`Error fetching profile: ${profileResponse.status} ${profileResponse.statusText}`);
      }
      const profileData = await profileResponse.json();

      const starredResponse = await fetch(profileData.starred_url.replace("{/owner}{/repo}", ""));
      const starredData = await starredResponse.json();

      const orgsResponse = await fetch(profileData.organizations_url);
      const orgsData = await orgsResponse.json();

      setUserProfile({
        ...profileData,
        starredCount: starredData.length,
        organizations: orgsData,
      });
    } catch (error) {
      console.error(error);
      setError(error.message); 
    }
  }
};



// Fetch Popular Repositories
const fetchPopularRepos = async () => {
  if (username.trim()) {
    setError(null); 
    try {
      const reposResponse = await fetch(`https://api.github.com/users/${username}/starred`);
      if (!reposResponse.ok) {
        throw new Error(`Error fetching repositories: ${reposResponse.status} ${reposResponse.statusText}`);
      }
      const reposData = await reposResponse.json();
      const sortedRepos = reposData.sort((a, b) => b.stargazers_count - a.stargazers_count);
      setPopularRepos(sortedRepos.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError(err.message); 
    }
  }
};

   // Filter events by type
   const handleEventTypeFilter = (eventType) => {
    setSelectedEventType(eventType);
    if (eventType === '') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((event) => event.type === eventType));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGitHubEvents();
    fetchUserProfile();
    fetchPopularRepos(); // Fetch popular repositories
  };

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
  <a href="#explore" className="text-gray-300 hover:text-blue-500 focus:text-blue-500 text-sm">Explore</a>
</div>

  {/* Right Section */}
  <div className="flex items-center space-x-4">
  <div className="relative">
    <input
      type="text"
      placeholder="Users, Repositories..."
      className="px-10 py-1 text-sm text-gray-900 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
    />
    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
      <FiSearch className="h-5 w-5" />
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
    <form
      onSubmit={handleSubmit}
      className="form flex items-center space-x-2 shadow-md transition-all ease-in-out duration-200"
    >
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Users, Repositories..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
        />

      </div>
    </form>
  </div>
</section>

{/* User Profile Section */}
{userProfile && (
  <section className="mb-8 text-center">
    <img
      src={userProfile.avatar_url}
      alt="Avatar"
      className="rounded-full w-32 h-32 mx-auto mb-4"
    />
    <h2 className="text-2xl font-bold">{userProfile.name}</h2>
    <p className="text-lg text-gray-400">{userProfile.bio}</p>
    {userProfile.location && (
      <p className="text-gray-500 mt-2">📍 {userProfile.location}</p>
    )}
    {userProfile.email && (
      <p className="text-gray-500 mt-2">📧 {userProfile.email}</p>
    )}
    <p className="text-sm text-gray-500 mt-2">
      {userProfile.followers} Followers | {userProfile.public_repos} Public Repos
    </p>
    <p className="text-sm text-gray-500 mt-2">
      ⭐ {userProfile.starredCount} Starred Repositories
    </p>

    {userProfile.organizations && userProfile.organizations.length > 0 && (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Organizations:</h3>
        <div className="flex flex-wrap justify-center gap-7 mt-4">
          {userProfile.organizations.map((org) => (
            <a
              key={org.id}
              href={org.url.replace("api.github.com/orgs", "github.com")} // Fix the URL for redirection
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center w-24 text-center hover:underline"
            >
              <img
                src={org.avatar_url}
                alt={`${org.login} logo`}
                className="w-16 h-16 rounded-full shadow-md"
              />
              <p className="text-sm text-blue-500 mt-2 break-words">{org.login}</p>
            </a>
          ))}
        </div>
      </div>
    )}

    <a
      href={userProfile.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 mt-4 inline-block"
    >
      View Profile
    </a>
  </section>
)}



{/* Filter Section */}
{isFilterVisible && (
  <section className="flex justify-end mb-8">
    <div className="space-x-4">
      <button
        onClick={() => handleEventTypeFilter('')}
        className={`px-4 py-2 rounded-lg ${
          selectedEventType === '' ? 'bg-blue-600' : 'bg-gray-700'
        } text-white`}
      >
        All Events
      </button>
      <button
        onClick={() => handleEventTypeFilter('PushEvent')}
        className={`px-4 py-2 rounded-lg ${
          selectedEventType === 'PushEvent' ? 'bg-blue-600' : 'bg-gray-700'
        } text-white`}
      >
        Push Events
      </button>
      <button
        onClick={() => handleEventTypeFilter('WatchEvent')}
        className={`px-4 py-2 rounded-lg ${
          selectedEventType === 'WatchEvent' ? 'bg-blue-600' : 'bg-gray-700'
        } text-white`}
      >
        Watch Events
      </button>
      <button
        onClick={() => handleEventTypeFilter('CreateEvent')}
        className={`px-4 py-2 rounded-lg ${
          selectedEventType === 'CreateEvent' ? 'bg-blue-600' : 'bg-gray-700'
        } text-white`}
      >
        Create Events
      </button>
    </div>
  </section>
)}




{/* Event List */}
{loading ? (
  <p className="text-center text-gray-400">Loading events...</p>
) : filteredEvents.length > 0 ? (
  <section>
    <div className="space-y-6">
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          className="bg-gray-800 shadow-xl hover:shadow-2xl rounded-lg p-6 transition-all transform hover:scale-105 duration-300"
        >
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <img
              src={event.actor.avatar_url}
              alt="User Avatar"
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg hover:scale-105 transform transition-all"
            />
            <div>
              {/* Event Type */}
              <h3 className="text-3xl font-semibold text-white">{event.type}</h3>
              <p className="text-sm text-gray-200 mt-1">
                {new Date(event.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Event Type Icons with Hover Effects */}
          <div className="mt-4 flex items-center space-x-4 text-white">
            {event.type === 'PushEvent' && (
              <span className="text-yellow-500 hover:text-yellow-300 transition-all">🔨 Push</span>
            )}
            {event.type === 'WatchEvent' && (
              <span className="text-green-500 hover:text-green-300 transition-all">👀 Watch</span>
            )}
            {event.type === 'CreateEvent' && (
              <span className="text-purple-500 hover:text-purple-300 transition-all">✨ Create</span>
            )}
          </div>

          {/* Repository Link */}
          <div className="mt-4">
            <p className="text-white font-medium">{event.repo.name}</p>
            <div className="mt-2">
              <a
                href={`https://github.com/${event.repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-blue-400 text-sm font-semibold transition-all duration-300"
              >
                View Repository
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
) : (
  <p className="text-center text-gray-400"></p>
)}



        {/* Popular Repositories Section */}
        {popularRepos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Popular Repositories</h2>
            <div className="space-y-6">
              {popularRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-gray-800 shadow-lg hover:shadow-2xl rounded-lg p-6 transition-all hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-blue-400">{repo.name}</h3>
                  <p className="text-gray-400 mt-2">{repo.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
                  </p>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 mt-4 inline-block"
                  >
                    View Repository
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center mt-12">
        <p>© 2024 GitTrack | Built with ❤️ by Akshay Kumar</p>
      </footer>
    </div>
  );
}

export default App;