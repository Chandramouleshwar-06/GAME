// src/components/QuestsModal.js
import React from 'react';
import { Target, Feather } from 'lucide-react'; // Import icons here

const QuestsModal = ({ activeQuest, availableQuests, acceptQuest, abandonQuest, onClose, generateQuests }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-purple-700 w-full max-w-2xl h-3/4 flex flex-col">
        <h2 className="text-3xl font-bold text-yellow-300 text-center mb-6 font-serif">
          {activeQuest ? "Active Quest" : "Available Quests"}
        </h2>
        <div className="flex-grow overflow-y-auto bg-gray-900 rounded-md p-4 border border-gray-700">
          {activeQuest ? (
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
                <p className="text-xl font-bold text-pink-400 mb-1 flex items-center gap-2">
                    <Target size={20} />{activeQuest.name}
                </p>
                <p className="text-lg text-gray-300 mb-2">{activeQuest.description}</p>
                <div className="text-sm text-gray-400">
                  <p><strong className="text-purple-300">Type:</strong> {activeQuest.type}</p>
                  <p><strong className="text-purple-300">Min Rank:</strong> {activeQuest.rankRequired}</p>
                  <p className="text-yellow-300 font-bold">Rewards:
                    {activeQuest.rewards.xp && ` ${activeQuest.rewards.xp} XP`}
                    {activeQuest.rewards.gold && `, ${activeQuest.rewards.gold} Gold`}
                    {activeQuest.rewards.item && `, ${activeQuest.rewards.item.rarity} ${activeQuest.rewards.item.name || activeQuest.rewards.item.type} `}
                    {activeQuest.rewards.stat && `, +${activeQuest.rewards.value} ${activeQuest.rewards.stat}`}
                    {activeQuest.rewards.newAbility && `, New Ability`}
                    {activeQuest.rewards.removesFlaw && `, Flaw Removed`}
                    {activeQuest.rewards.rank && `, Rank Up to ${activeQuest.rewards.rank}!`}
                  </p>
                </div>
                {/* Tasks section - Placeholder for now */}
                <div className="mt-4">
                  <p className="text-purple-300 font-bold">Tasks:</p>
                  {activeQuest.type === "Battle Quest" && (
                    <p className="text-gray-200">
                      Win {activeQuest.progress.currentWins || 0}/{activeQuest.specifics.winsRequired} fights against {activeQuest.specifics.enemyType}.
                    </p>
                  )}
                  {/* Add other quest types' tasks here */}
                  <button
                    // This button would trigger combat specific to the quest
                    onClick={() => alert(`Starting quest task for: ${activeQuest.name}! (Feature to be implemented: dynamic navigation to activity)`)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-md font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Go to Task
                  </button>
                </div>
                <button
                  onClick={abandonQuest}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-md font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                >
                  Abandon Quest
                </button>
              </div>
            </div>
          ) : (
            availableQuests.length > 0 ? (
              <div className="space-y-4">
                {availableQuests.map((quest, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
                    <p className="text-xl font-bold text-pink-400 mb-1 flex items-center gap-2">
                        <Target size={20} />{quest.name}
                    </p>
                    <p className="text-lg text-gray-300 mb-2">{quest.description}</p>
                    <div className="text-sm text-gray-400">
                      <p><strong className="text-purple-300">Type:</strong> {quest.type}</p>
                      <p><strong className="text-purple-300">Min Rank:</strong> {quest.rankRequired}</p>
                      <p className="text-yellow-300 font-bold">Rewards:
                        {quest.rewards.xp && ` ${quest.rewards.xp} XP`}
                        {quest.rewards.gold && `, ${quest.rewards.gold} Gold`}
                        {quest.rewards.item && `, ${quest.rewards.item.rarity} ${quest.rewards.item.name || quest.rewards.item.type} `}
                        {quest.rewards.stat && `, +${quest.rewards.value} ${quest.rewards.stat}`}
                        {quest.rewards.newAbility && `, New Ability`}
                        {quest.rewards.removesFlaw && `, Flaw Removed`}
                        {quest.rewards.rank && `, Rank Up to ${quest.rewards.rank}!`}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptQuest(quest)}
                      className="mt-3 px-4 py-2 bg-green-600 text-white text-md font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
                    >
                      Accept Quest
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-xl py-10">No quests available at your current rank or for your character.</p>
            )
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

export default QuestsModal;
