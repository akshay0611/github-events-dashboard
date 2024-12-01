import React, { useState, useEffect } from 'react';
import ErrorPage from './components/ErrorPage';

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
      <header className="bg-gray-800 text-white p-8 text-center rounded-b-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/logo.webp" alt="Logo" className="h-16 w-auto" />
        </div>
        <h1 className="text-4xl font-extrabold">GitHub Events Dashboard</h1>
        <p className="mt-2 text-xl font-light">Track your GitHub activity and stay updated!</p>
      </header> 

      {/* Main Content */}
      <main className="p-8">
        {/* User Input Form */}
        <section className="max-w-lg mx-auto mb-8">
          <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-lg p-6 space-y-6 border-t-8 border-blue-600">
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Enter GitHub Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                Fetch Data
              </button>
            </div>
          </form>
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
                  className="bg-gray-800 shadow-lg hover:shadow-2xl rounded-lg p-6 transition-all hover:scale-105"
                >
                  <h3 className="text-2xl font-semibold text-blue-400">{event.type}</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                  <p className="mt-3 text-gray-200 font-medium">{event.repo.name}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-gray-400">No events found for this user.</p>
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
        <p>© 2024 GitHub Events Dashboard | Built with ❤️ by Akshay Kumar</p>
      </footer>
    </div>
  );
}

export default App;