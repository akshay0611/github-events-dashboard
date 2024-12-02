import React, { useState } from 'react';
import Header from './components/Header';
import UserInputForm from './components/UserInputForm';
import TrendingRepos from './components/TrendingRepos';

function App() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [mainSearch, setMainSearch] = useState('');

  return (
    <div className="App bg-gray-900 text-white min-h-screen">
      <Header headerSearch={headerSearch} setHeaderSearch={setHeaderSearch} />

      <main className="p-8">
        <UserInputForm mainSearch={mainSearch} setMainSearch={setMainSearch} />
        <TrendingRepos />
      </main>

      <footer className="bg-gray-800 text-white py-4 text-center mt-12">
        <p>© 2024 GitTrack | Built with ❤️ by Akshay Kumar</p>
      </footer>
    </div>
  );
}

export default App;
