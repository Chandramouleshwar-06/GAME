// src/components/GameActions.jsx
import React from 'react';
import { ScrollText, Sword, Target, Briefcase, Gem, Feather } from 'lucide-react';

const GameActions = ({ generateQuests, startMockCombat, setShowInventoryModal }) => {
  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Quests Section */}
      <div className="text-center bg-gray-700 p-6 rounded-xl shadow-lg border border-purple-600">
        <h3 className="text-3xl font-bold text-indigo-400 mb-4 flex items-center justify-center gap-2">
          <ScrollText size={30} className="text-indigo-300" />
          Quests
        </h3>
        <p className="text-lg text-gray-300 mb-4">
          Embark on quests to earn XP, level up, and unlock new challenges.
        </p>
        <button
          onClick={generateQuests}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-xl font-bold rounded-xl shadow-md hover:from-indigo-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          View Quests
          <Feather className="inline-block ml-2" size={20} />
        </button>
      </div>

      {/* Combat Section */}
      <div className="text-center bg-gray-700 p-6 rounded-xl shadow-lg border border-purple-600">
        <h3 className="text-3xl font-bold text-emerald-400 mb-4 flex items-center justify-center gap-2">
          <Sword size={30} className="text-emerald-300" />
          Combat Arena
        </h3>
        <p className="text-lg text-gray-300 mb-4">
          Test your might against AI opponents in turn-based combat.
        </p>
        <button
          onClick={startMockCombat}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xl font-bold rounded-xl shadow-md hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Find Opponent
          <Target className="inline-block ml-2" size={20} />
        </button>
      </div>

      {/* Inventory Section */}
      <div className="text-center bg-gray-700 p-6 rounded-xl shadow-lg border border-purple-600 col-span-1 sm:col-span-2">
        <h3 className="text-3xl font-bold text-orange-400 mb-4 flex items-center justify-center gap-2">
          <Briefcase size={30} className="text-orange-300" />
          Inventory
        </h3>
        <p className="text-lg text-gray-300 mb-4">
          Manage your earned items, artifacts, and equipment.
        </p>
        <button
          onClick={() => setShowInventoryModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white text-xl font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          View Inventory
          <Gem className="inline-block ml-2" size={20} />
        </button>
      </div>
    </div>
  );
};

export default GameActions;