    // src/components/CharacterSummary.js
    import React from 'react';
    import { levelUpThresholds } from '../data/gameData'; // Import from data folder

    const CharacterSummary = ({ char }) => {
      if (!char) return null;
      const stats = char.Stats || {};
      const statsStr = Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join('\n');

      return (
        <div className="p-6 bg-purple-900 rounded-lg shadow-xl border border-purple-700 flex flex-col items-center">
          <h3 className="text-3xl font-bold text-yellow-300 mb-4 font-serif">--- {char.name || 'Unnamed Hero'} ---</h3>
          <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Race:</strong> {char.Race || 'N/A'}</p>
          <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Ability:</strong> {char.Ability || 'N/A'}</p>
          <div className="bg-purple-800 p-4 rounded-md mb-2 w-full max-w-md">
            <p className="text-lg text-pink-400 mb-2 font-bold">Stats:</p>
            <pre className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">{statsStr || 'N/A'}</pre>
          </div>
          <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Weapon:</strong> {char['Weapon Yes/No'] || 'N/A'}</p>
          {char['Weapon Yes/No'] === 'Yes' && (
            <div className="ml-4 text-gray-300">
              <p><strong className="text-pink-400">Type:</strong> {char['Weapon Type'] || 'N/A'}</p>
              <p><strong className="text-pink-400">Grade:</strong> {char['Weapon Grade'] || 'N/A'}</p>
              <p><strong className="text-pink-400">Mastery:</strong> {char['Weapon Mastery'] || 'N/A'}</p>
            </div>
          )}
          <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Special Ability:</strong> {char['Special Ability'] || 'N/A'}</p>
          <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Fatal Flaw:</strong> {char['Fatal Flaw'] || 'N/A'}</p>
          <div className="mt-4 text-center">
            <p className="text-xl text-yellow-300 font-bold">Nexus Rating: {char['Nexus Rating'] || 'N/A'}</p>
            <p className="text-xl text-yellow-300 font-bold">Nexus Rank: {char['Nexus Rank'] || 'N/A'}</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-200"><strong className="text-green-400">XP:</strong> {char.XP || 0} / {levelUpThresholds[char.Level] || 'MAX'}</p>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${Math.min(100, (char.XP / (levelUpThresholds[char.Level] || 1)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-lg text-gray-200"><strong className="text-green-400">Level:</strong> {char.Level || 1}</p>
            {char.floatingStatPoints > 0 && (
              <p className="text-lg text-yellow-400 mt-2">
                <strong className="text-yellow-500">Floating Stat Points:</strong> {char.floatingStatPoints}
              </p>
            )}
          </div>
        </div>
      );
    };

    export default CharacterSummary;
    