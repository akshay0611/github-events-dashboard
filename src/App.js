import React, { useState } from 'react';
import Header from './components/Header';
import UserInputForm from './components/UserInputForm';
import TrendingRepos from './components/TrendingRepos';
import RecommendedForYou from './components/RecommendedForYou'; // Import the component
import Footer from './components/Footer'; // Import Footer component


function App() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [mainSearch, setMainSearch] = useState('');

  return (
    <div className="App bg-gray-900 text-white min-h-screen">
      <Header headerSearch={headerSearch} setHeaderSearch={setHeaderSearch} />

      <main className="p-8">
        <UserInputForm mainSearch={mainSearch} setMainSearch={setMainSearch} />
        <TrendingRepos />
        <RecommendedForYou /> {/* Add the component below TrendingRepos */}
      </main>

      <Footer /> {/* Use Footer component here */}
    </div>
  );
}

export default App;
