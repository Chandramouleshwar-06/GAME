// src/components/RankingsModal.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';

const RankingsModal = ({ showRankingsModal, allRankings, onClose }) => {
  if (!showRankingsModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-purple-700 w-full max-w-2xl h-3/4 flex flex-col">
        <h2 className="text-3xl font-bold text-yellow-300 text-center mb-6 font-serif">All Character Rankings</h2>
        <div className="flex-grow overflow-y-auto bg-gray-900 rounded-md p-4 border border-gray-700">
          {allRankings.length > 0 ? (
            <table className="min-w-full text-left text-gray-200">
              <thead className="border-b border-gray-600 sticky top-0 bg-gray-900 z-10">
                <tr>
                  <th className="py-2 px-3 text-lg font-semibold text-pink-400">Name</th>
                  <th className="py-2 px-3 text-lg font-semibold text-pink-400">Race</th>
                  <th className="py-2 px-3 text-lg font-semibold text-pink-400">Rating</th>
                  <th className="py-2 px-3 text-lg font-semibold text-pink-400">Rank</th>
                  <th className="py-2 px-3 text-lg font-semibold text-pink-400">Level</th>
                  <th className="py-2 px-3 text-lg font-semibold text-pink-400">XP</th>
                </tr>
              </thead>
              <tbody>
                {allRankings.map((char, index) => (
                  <tr key={index} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors duration-200">
                    <td className="py-2 px-3">{char.name || 'Unnamed'}</td>
                    <td className="py-2 px-3">{char.Race || 'N/A'}</td>
                    <td className="py-2 px-3">{char['Nexus Rating'] || 'N/A'}</td>
                    <td className="py-2 px-3">{char['Nexus Rank'] || 'N/A'}</td>
                    <td className="py-2 px-3">{char.Level || 1}</td>
                    <td className="py-2 px-3">{char.XP || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-400 text-xl py-10">No characters have been generated yet for this user ID.</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 transform hover:scale-105 active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RankingsModal;