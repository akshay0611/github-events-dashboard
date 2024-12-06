import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./UserProfile.css";
import { IoLocationOutline, IoBusinessOutline } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { Line } from "react-chartjs-2"; 
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";

// Register required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


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
  const [subTab, setSubTab] = useState("pullRequests");  
  const [prOpenedCount, setPrOpenedCount] = useState(0); 
  const [contributedReposCount, setContributedReposCount] = useState(0); 
  const [prDataOverTime, setPrDataOverTime] = useState([]);
  const [selectedRange, setSelectedRange] = useState(30);
  const [filteredPrData, setFilteredPrData] = useState([]);
  const [repositories, setRepositories] = useState([]);

  // Helper function to calculate the number of days ago from the current date
  const getDaysAgo = (date) => {
    const currentDate = new Date();
    const prDate = new Date(date);
    const timeDifference = currentDate - prDate; 
    return Math.floor(timeDifference / (1000 * 3600 * 24)); 
  };

  // Fetch data for user, repositories, PRs, and issues
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
          fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr+is:open`, { headers }), 
          fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, { headers }), 
        ]);

        if (!userResponse.ok || !reposResponse.ok || !prResponse.ok || !issuesResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const user = await userResponse.json();
        const repos = await reposResponse.json();
        const prData = await prResponse.json();
        const issueData = await issuesResponse.json();

        // Fetch detailed PR data for each PR
        const detailedPullRequests = await fetchDetailedPullRequests(prData.items, headers);

        // Set PR opened count and other PR-related data

        setPrOpenedCount(prData.total_count);
        setPrDataOverTime(processPrDataOverTime(prData.items)); // Process PR data over time
        
        // Extract and set contributed repositories
        const contributedRepos = extractContributedRepos(prData.items);
        setRepositories(contributedRepos);
        setContributedReposCount(contributedRepos.length);

        // Set user data and repositories
        setUserData(user);
        setUserRepos(repos);
        setUserPullRequests(detailedPullRequests); 
        setUserIssues(issueData.items); // Set the issues data

        // Calculate and set language stats
        const languageStats = await fetchLanguageStats(repos, headers);
        setLanguageData(languageStats);

      } catch (err) {
        setError(err.message || "Error loading user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    }, [username]);
     // Filter PR data based on the selected range
     useEffect(() => {
      const filteredData = prDataOverTime.filter(
      (data) => data.daysAgo <= selectedRange
       );
       setFilteredPrData(filteredData);
  }, [selectedRange, prDataOverTime]); 

  // Function to fetch detailed PR data for each PR
  const fetchDetailedPullRequests = async (prItems, headers) => {
    const prDetails = await Promise.all(
      prItems.map(async (pr) => {
        const prDetailsResponse = await fetch(pr.pull_request.url, { headers });
        if (!prDetailsResponse.ok) {
          return null; // Handle failed requests gracefully
        }
        const prDetails = await prDetailsResponse.json();
        return {
          ...pr,
          changed_files: prDetails.changed_files,
          additions: prDetails.additions,
          deletions: prDetails.deletions,
          merged_at: prDetails.merged_at, // For the "Date Approved" column
          updated_at: prDetails.updated_at, // For the "Last Commit Date" column
          repository_url: pr.repository_url // Add repository URL directly here
        };
      })
    );
    return prDetails.filter(Boolean); // Remove null values
  };

  // Function to process PR data over time (days ago)
   const processPrDataOverTime = (prItems) => {
    const dateCounts = {};
    prItems.forEach((pr) => {
      const daysAgo = getDaysAgo(pr.created_at); // Get days ago
      dateCounts[daysAgo] = (dateCounts[daysAgo] || 0) + 1; // Increment count for the days ago
    });

    // Create a complete dataset for the past 365 days
    return Array.from({ length: 365 }, (_, i) => {
      const day = 365 - i; // Reverse days ago (365 to 1)
      return {
        daysAgo: day,
        count: dateCounts[day] || 0, // Use 0 if no data exists for the day
      };
    });
  };

  // Function to extract unique repositories from PR data
  const extractContributedRepos = (prItems) => {
    const contributedRepos = new Set();
    prItems.forEach((pr) => {
      if (pr.repository_url) contributedRepos.add(pr.repository_url);
    });
    return Array.from(contributedRepos).map((repoUrl) => ({
      name: repoUrl.split("/").slice(-2).join("/"),
      avatarUrl: `https://github.com/${repoUrl.split("/")[4]}.png`,
    }));
  };

  // Function to fetch language stats from repositories
  const fetchLanguageStats = async (repos, headers) => {
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

    return Object.fromEntries(sortedLanguages);
  };


  const chartData = {
    labels: filteredPrData.map((data, index) => {
      const daysAgo = selectedRange - index; // For 7 days, 30 days, etc.
      return `${daysAgo} days ago`;  // Generate "X days ago" label
    }),
    datasets: [
      {
        label: "PRs Raised",
        data: filteredPrData.map((data) => data.count),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        pointBackgroundColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            // Calculate the correct 'days ago' value based on the index
            const index = tooltipItems[0].dataIndex;
            const daysAgo = selectedRange - index; // Adjust for selected range
            return `${daysAgo} days ago`; // Show days ago in tooltip
          },
          label: (tooltipItem) => `PRs Raised: ${tooltipItem.raw}`, // Show PR count in tooltip
        },
      },
      legend: { display: false }, // Hide legend for a cleaner look
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: false, // Hide X-axis ticks (labels)
        },
      },
      y: {
        display: false,
      },
    },
  };
  

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
        {/* Display PRs opened & Contributed Repos count */}
        {userData && (
          <div className="contribution-summary mb-6">
            <p>PRs Opened: {prOpenedCount}</p>
            <p>Contributed Repos: {contributedReposCount}</p>
            {/* Dropdown for Range Selection */}
      <div className="range-selector">
        <label htmlFor="range">Select Range:</label>
        <select
          id="range"
          value={selectedRange}
          onChange={(e) => setSelectedRange(Number(e.target.value))}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={120}>Last 6 Months</option>
          <option value={365}>Last 1 Year</option>
        </select>
      </div>
            {/* Chart */}
            <div style={{ width: "80%", margin: "0 auto" }}>
              <Line data={chartData} options={chartOptions} />
            </div>

{/* Repositories Contributed To */}
<h3>Repositories Contributed To</h3>
<div className="repositories-list">
  {repositories.map((repo, index) => (
    <div
      key={index}
      className="repo-badge"
    >
      <img
        src={repo.avatarUrl}
        alt={repo.name}
      />
      <span>{repo.name.split('/')[1]}</span> {/* Extracts repo name without the owner */}
    </div>
  ))}
</div>








          </div>
        )}

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
            <h3 className="text-lg font-semibold mb-2">Latest PRs</h3>
            {userPullRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-gray-700 rounded-lg shadow-md">
                  <thead>
                    <tr>
                      <th className="font-semibold">Latest PRs</th>
                      <th className="font-semibold">Last Commit Date</th>
                      <th className="font-semibold">Date Approved</th>
                      <th className="font-semibold">Files Touched</th>
                      <th className="font-semibold">Lines Touched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPullRequests.slice(0, 15).map((pr) => (
                      <tr key={pr.id} className="bg-gray-800 border-b border-gray-600">
                        <td>
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-semibold"
                          >
                            {pr.title}
                          </a>
                        </td>
                        <td>
                          {formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true })}
                        </td>
                        <td>
                          {pr.merged_at
                            ? formatDistanceToNow(new Date(pr.merged_at), { addSuffix: true })
                            : "Not yet approved"}
                        </td>
                        <td>
                          {pr.changed_files} Files
                        </td>
                        <td>
                          {pr.additions + pr.deletions} Lines
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No recent pull requests.</p>
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
