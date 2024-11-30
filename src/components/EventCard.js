// src/components/EventCard.js
import React from 'react';

const EventCard = ({ event }) => {
  const eventType = event.type;
  const repoName = event.repo.name;
  const createdAt = new Date(event.created_at).toLocaleString();

  return (
    <div className="bg-white shadow-lg rounded-md p-6 mb-4 hover:shadow-xl transition-all">
      <p className="font-semibold text-gray-800">
        Event Type: <span className="text-blue-600">{eventType}</span>
      </p>
      <p className="text-gray-600 mt-2">
        Repository: <span className="text-gray-900">{repoName}</span>
      </p>
      <p className="text-sm text-gray-500 mt-2">{createdAt}</p>
    </div>
  );
};

export default EventCard;
