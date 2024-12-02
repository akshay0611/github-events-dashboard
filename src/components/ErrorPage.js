import React from 'react';

const ErrorPage = ({ errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6">
      {/* Error Message Container */}
      <div className="bg-gray-800 shadow-2xl rounded-lg p-10 text-center max-w-lg border border-gray-700">
        <h1 className="text-6xl font-extrabold text-red-500 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-6">
          Oops! Something went wrong.
        </h2>
        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
          {errorMessage || 'The page you’re looking for doesn’t exist, or there was an error processing your request.'}
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Retry
        </button>

        {/* Navigation Links */}
        <div className="mt-8">
          <a
            href="/"
            className="text-blue-400 hover:underline text-sm block mb-2"
          >
            Return to Homepage
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-300 text-sm"
          >
            Visit GitHub
          </a>
        </div>
      </div>

      {/* Decorative Separator */}
      <div className="h-1 w-24 bg-blue-600 rounded-full mt-12"></div>

      {/* Footer */}
      <footer className="mt-6 text-gray-500 text-sm">
        <p>© 2024 GitTrack. Built with ❤️ by Akshay Kumar.</p>
      </footer>
    </div>
  );
};

export default ErrorPage;
