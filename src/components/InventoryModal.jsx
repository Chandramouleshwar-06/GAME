// src/components/InventoryModal.jsx
import React from 'react';

const InventoryModal = ({ showInventoryModal, character, onClose }) => {
  if (!showInventoryModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-purple-700 w-full max-w-2xl h-3/4 flex flex-col">
        <h2 className="text-3xl font-bold text-yellow-300 text-center mb-6 font-serif">Your Inventory</h2>
        <div className="flex-grow overflow-y-auto bg-gray-900 rounded-md p-4 border border-gray-700">
          {character?.inventory?.length > 0 ? (
            <div className="space-y-4">
              {character.inventory.map((item, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600 flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-emerald-400">{item.name || "Unnamed Item"} {item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                    <p className="text-md text-gray-300">Type: {item.type} | Rarity: {item.rarity}</p>
                    {item.statBonus && (
                      <p className="text-sm text-gray-400">Bonus: {Object.entries(item.statBonus).map(([s, val]) => `${s}: +${val}`).join(', ')}</p>
                    )}
                    {item.effect && (
                      <p className="text-sm text-gray-400">Effect: {item.effect}</p>
                    )}
                  </div>
                  {/* Future: Add 'Equip' or 'Use' button */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-xl py-10">Your inventory is empty. Complete quests to find loot!</p>
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

export default InventoryModal;