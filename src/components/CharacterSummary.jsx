// src/components/CharacterSummary.jsx
import React from 'react';
import { levelUpThresholds } from '../gameData.js'; // Import levelUpThresholds with .js extension

const CharacterSummary = ({ character }) => {
  if (!character) return null;
  const stats = character.Stats || {};
  const statsStr = Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join('\n');

  return (
    <div className="p-6 bg-purple-900 rounded-lg shadow-xl border border-purple-700 flex flex-col items-center">
      <h3 className="text-3xl font-bold text-yellow-300 mb-4 font-serif">--- {character.name || 'Unnamed Hero'} ---</h3>
      <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Race:</strong> {character.Race || 'N/A'}</p>
      <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Ability:</strong> {character.Ability || 'N/A'}</p>
      <div className="bg-purple-800 p-4 rounded-md mb-2 w-full max-w-md">
        <p className="text-lg text-pink-400 mb-2 font-bold">Stats:</p>
        <pre className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">{statsStr || 'N/A'}</pre>
      </div>
      <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Weapon:</strong> {character['Weapon Yes/No'] || 'N/A'}</p>
      {character['Weapon Yes/No'] === 'Yes' && (
        <div className="ml-4 text-gray-300">
          <p><strong className="text-pink-400">Type:</strong> {character['Weapon Type'] || 'N/A'}</p>
          <p><strong className="text-pink-400">Grade:</strong> {character['Weapon Grade'] || 'N/A'}</p>
          <p><strong className="text-pink-400">Mastery:</strong> {character['Weapon Mastery'] || 'N/A'}</p>
        </div>
      )}
      <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Special Ability:</strong> {character['Special Ability'] || 'N/A'}</p>
      <p className="text-lg text-gray-200 mb-2"><strong className="text-pink-400">Fatal Flaw:</strong> {character['Fatal Flaw'] || 'N/A'}</p>
      <div className="mt-4 text-center">
        <p className="text-xl text-yellow-300 font-bold">Nexus Rating: {character['Nexus Rating'] || 'N/A'}</p>
        <p className="text-xl text-yellow-300 font-bold">Nexus Rank: {character['Nexus Rank'] || 'N/A'}</p>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg text-gray-200"><strong className="text-green-400">XP:</strong> {character.XP || 0} / {levelUpThresholds[character.Level] || 'MAX'}</p>
        <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${Math.min(100, (character.XP / (levelUpThresholds[character.Level] || 1)) * 100)}%` }}
          ></div>
        </div>
        <p className="text-lg text-gray-200"><strong className="text-green-400">Level:</strong> {character.Level || 1}</p>
        {character.floatingStatPoints > 0 && (
          <p className="text-lg text-yellow-400 mt-2">
            <strong className="text-yellow-500">Floating Stat Points:</strong> {character.floatingStatPoints}
          </p>
        )}
      </div>
    </div>
  );
};

export default CharacterSummary;