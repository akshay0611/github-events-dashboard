import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./UserProfile.css";
import { IoLocationOutline, IoBusinessOutline } from 'react-icons/io5';




const UserProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [languageData, setLanguageData] = useState({});
  const [tab, setTab] = useState("contributions");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPullRequests, setUserPullRequests] = useState([]); 
  const [userIssues, setUserIssues] = useState([]); 
  const [subTab, setSubTab] = useState("pullRequests");  // Default to "pullRequests"

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const token = process.env.REACT_APP_GITHUB_TOKEN; // Get token from .env

        const headers = {
          Authorization: `token ${token}`,
        };

        const [userResponse, reposResponse, prResponse, issuesResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`, { headers }),
          fetch(`https://api.github.com/users/${username}/repos`, { headers }),
          fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers }), // Pull requests
          fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, { headers }), // Issues
        ]);

        if (!userResponse.ok || !reposResponse.ok || !prResponse.ok || !issuesResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const user = await userResponse.json();
        const repos = await reposResponse.json();
        const prData = await prResponse.json();
        const issueData = await issuesResponse.json();

        setUserData(user);
        setUserRepos(repos);
        setUserPullRequests(prData.items); // Set the pull requests data
        setUserIssues(issueData.items); // Set the issues data

        // Calculate language breakdown
        const languageStats = {};
        for (const repo of repos) {
          const languagesResponse = await fetch(repo.languages_url, { headers });
          const languages = await languagesResponse.json();
          Object.keys(languages).forEach((language) => {
            languageStats[language] = (languageStats[language] || 0) + languages[language];
          });
        }

        // Calculate percentages
        const totalBytes = Object.values(languageStats).reduce((acc, bytes) => acc + bytes, 0);
        const languagePercentages = {};
        Object.entries(languageStats).forEach(([lang, bytes]) => {
          languagePercentages[lang] = ((bytes / totalBytes) * 100).toFixed(2);
        });

        // Sort by percentage and limit to top 5 languages
        const sortedLanguages = Object.entries(languagePercentages)
          .sort((a, b) => b[1] - a[1]) // Sort by percentage in descending order
          .slice(0, 5); // Limit to top 5 languages

        const topLanguages = Object.fromEntries(sortedLanguages);
        setLanguageData(topLanguages);
      } catch (err) {
        setError(err.message || "Error loading user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const getLanguageColor = (language) => {
    const colors = {
      HTML: "#E34C26",
      JavaScript: "#F7DF1E",
      CSS: "#1572B6",
      Java: "#007396",
      SCSS: "#CC6699",
      Python: "#3572A5",
      TypeScript: "#3178C6",
      Shell: "#89E051",
      Ruby: "#701516",
      Go: "#00ADD8",
    };
    return colors[language] || "#6B7280"; // Default gray for unrecognized languages
  };

  const renderLanguageBreakdown = () => {
    if (loading) return <p>Loading language data...</p>;
    if (!Object.keys(languageData).length) return <p>No language data found.</p>;

    return (
      <div className="languages-section mt-6">
        <h3 className="text-xl font-bold mb-4">Languages Used</h3>
        <div className="languages-bar">
          {Object.entries(languageData).map(([lang, percent]) => (
            <div
              key={lang}
              className="language-segment"
              style={{
                width: `${percent}%`,
                backgroundColor: getLanguageColor(lang),
              }}
              title={`${lang}: ${percent}%`}
            ></div>
          ))}
        </div>
        <ul className="languages-list mt-4">
          {Object.entries(languageData).map(([lang, percent]) => (
            <li key={lang} className="language-item flex justify-between items-center">
              <div className="flex items-center">
                <span
                  className="language-circle"
                  style={{
                    backgroundColor: getLanguageColor(lang),
                  }}
                ></span>
                <span className="language-name ml-2">{lang}</span>
              </div>
              <span className="language-percent">{percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <Header />
        <div className="loading-container">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <Header />
        <div className="error-container">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="user-profile-page bg-gray-900 text-white min-h-screen">
      <Header />

      <div className="user-profile-layout flex flex-col lg:flex-row gap-6 p-6">
        {/* User Header Section */}
        <div className="user-header bg-gray-800 p-6 rounded shadow-md flex-grow lg:max-w-xs">
  {/* User Avatar */}
  <img
    src={userData.avatar_url}
    alt="User Avatar"
    className="rounded-full w-32 h-32 border-4 border-orange-500 mx-auto"
  />
  
  {/* User Name and GitHub Handle */}
  <h1 className="text-2xl font-bold text-center mt-4">{userData.name || userData.login}</h1>
  <p className="text-center text-gray-400">@{userData.login}</p>

  {/* User Bio */}
  {userData.bio && (
    <p className="text-center text-gray-300 mt-2">{userData.bio}</p>
  )}

{/* User Location */}
{userData.location && (
        <p className="text-center text-gray-400 mt-2">
          <IoLocationOutline className="inline-block mr-2" /> {userData.location}
        </p>
      )}

  {/* Followers and Following count */}
  <div className="text-center mt-4">
    <span className="text-gray-400">{userData.followers} Followers</span> | 
    <span className="text-gray-400">{userData.following} Following</span>
  </div>

  {/* User Company/Organization */}
  {userData.company && (
        <p className="text-center text-gray-400 mt-2">
          <IoBusinessOutline className="inline-block mr-2" /> {userData.company}
        </p>
      )}

  {/* GitHub Stats */}
  <div className="text-center mt-4">
    <span className="text-gray-400">Public Repos: {userData.public_repos}</span> | 
    <span className="text-gray-400">Gists: {userData.public_gists}</span>
  </div>

  {/* Language Breakdown */}
  {renderLanguageBreakdown()}
  
  {/* View Profile Button */}
  <div className="text-center mt-4">
    <a
      href={userData.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline"
    >
      View Full Profile
    </a>
  </div>
</div>


{/* Tabs Section */}
<div className="tabs-container bg-gray-800 p-6 rounded shadow-md flex-grow">
  <div className="tabs-header flex justify-between mb-6">
    <button
      onClick={() => setTab("contributions")}
      className={`tab-button ${tab === "contributions" ? "active" : ""}`}
    >
      Contributions
    </button>
    <button
      onClick={() => setTab("highlights")}
      className={`tab-button ${tab === "highlights" ? "active" : ""}`}
    >
      Highlights
    </button>
  </div>

  <div className="tab-content">
    {tab === "contributions" && (
      <div>
        {/* Sub-tabs for Pull Requests and Issues */}
        <div className="sub-tabs-header flex justify-between mb-6">
          <button
            onClick={() => setSubTab("pullRequests")}
            className={`tab-button ${subTab === "pullRequests" ? "active" : ""}`}
          >
            Pull Requests
          </button>
          <button
            onClick={() => setSubTab("issues")}
            className={`tab-button ${subTab === "issues" ? "active" : ""}`}
          >
            Issues
          </button>
        </div>

        {/* Content for the selected sub-tab */}
        {subTab === "pullRequests" && (
          <div className="highlights-section mb-6">
          <h3 className="text-lg font-semibold mb-2">Recent Pull Requests</h3>
          {userPullRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto bg-gray-700 rounded-lg shadow-md">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Latest PRs</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Last Commit Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Date Approved</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Files Touched</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Lines Touched</th>
                  </tr>
                </thead>
                <tbody>
                  {userPullRequests.slice(0, 5).map((pr) => (
                    <tr key={pr.id} className="bg-gray-800 border-b border-gray-600">
                      <td className="px-4 py-2 text-sm text-gray-300">
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-semibold"
                        >
                          {pr.title}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {new Date(pr.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {pr.merged_at
                          ? new Date(pr.merged_at).toLocaleDateString()
                          : "Not yet approved"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {pr.changed_files} Files
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {pr.additions + pr.deletions} Lines
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-300">No recent pull requests.</p>
          )}
        </div>        
        )}

        {subTab === "issues" && (
          <div className="highlights-section">
            <h3 className="text-lg font-semibold mb-2">Recent Issues</h3>
            {userIssues.length > 0 ? (
              <ul className="space-y-3">
                {userIssues.slice(0, 5).map((issue) => (
                  <li key={issue.id} className="highlight-item bg-gray-700 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        {issue.title}
                      </a>
                      <span className="text-sm text-gray-400">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      {issue.state === "open" ? "Open" : "Closed"} | {issue.comments} Comments
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300">No recent issues.</p>
            )}
          </div>
        )}
      </div>
    )}

    {tab === "highlights" && (
      <div>
        <p className="text-gray-300 text-center">{username} doesn't have any highlights yet!</p>
      </div>
    )}
  </div>
</div>




</div>

      <Footer />
    </div>
  );
};

export default UserProfile;
