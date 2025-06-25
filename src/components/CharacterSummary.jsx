import React from 'react';
import { Crown, Sword, Shield, Zap, Skull, Star, TrendingUp, Heart } from 'lucide-react';
import { levelUpThresholds } from '../gameData.js';

const CharacterSummary = ({ character }) => {
  if (!character) return null;
  
  const stats = character.Stats || {};
  
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'Mythic': return 'text-purple-400';
      case 'Legendary': return 'text-amber-400';
      case 'Epic': return 'text-pink-400';
      case 'Rare': return 'text-blue-400';
      case 'Uncommon': return 'text-emerald-400';
      default: return 'text-slate-300';
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 'SS/S+': return 'text-purple-400';
      case 'S': return 'text-amber-400';
      case 'A': return 'text-pink-400';
      case 'B': return 'text-blue-400';
      case 'C': return 'text-emerald-400';
      default: return 'text-slate-300';
    }
  };

  const getRankGradient = (rank) => {
    switch(rank) {
      case 'SS/S+': return 'from-purple-500 to-pink-500';
      case 'S': return 'from-amber-400 to-yellow-400';
      case 'A': return 'from-pink-400 to-red-400';
      case 'B': return 'from-blue-400 to-cyan-400';
      case 'C': return 'from-emerald-400 to-green-400';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80 rounded-3xl shadow-2xl border border-amber-500/30 p-8 lg:p-12 backdrop-blur-sm relative overflow-hidden mb-12">
      
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Character Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
              <Crown size={32} className="text-white" />
            </div>
            <h3 className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-fantasy">
              {character.name || 'Unnamed Hero'}
            </h3>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl">
              <Star size={32} className="text-white animate-pulse" />
            </div>
          </div>
          
          {/* Nexus Rating & Rank */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-8">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-2xl p-6 border border-purple-400/50 backdrop-blur-sm shadow-lg">
              <p className="text-lg text-purple-200 mb-2 font-serif">Nexus Rating</p>
              <p className="text-4xl font-bold text-purple-400 font-fantasy">{character['Nexus Rating'] || 'N/A'}</p>
            </div>
            <div className={`bg-gradient-to-br ${getRankGradient(character['Nexus Rank'])}/20 rounded-2xl p-6 border border-current/50 backdrop-blur-sm shadow-lg`}>
              <p className="text-lg text-slate-200 mb-2 font-serif">Nexus Rank</p>
              <p className={`text-4xl font-bold ${getRankColor(character['Nexus Rank'])} font-fantasy`}>
                {character['Nexus Rank'] || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Character Details Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Basic Info */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/30 rounded-2xl p-6 border border-emerald-400/30 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3 font-fantasy">
                <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                  <Star size={16} className="text-white" />
                </div>
                Heritage & Abilities
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-emerald-200 font-serif">Race:</span>
                  <span className="text-white font-bold">{character.Race || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-emerald-200 font-serif">Racial Ability:</span>
                  <span className="text-white font-bold">{character.Ability || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-emerald-200 font-serif">Special Power:</span>
                  <span className="text-purple-400 font-bold">{character['Special Ability'] || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Weapon Info */}
            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-6 border border-red-400/30 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3 font-fantasy">
                <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                  <Sword size={16} className="text-white" />
                </div>
                Arsenal
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-red-200 font-serif">Armed:</span>
                  <span className="text-white font-bold">{character['Weapon Yes/No'] || 'N/A'}</span>
                </div>
                {character['Weapon Yes/No'] === 'Yes' && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-red-200 font-serif">Type:</span>
                      <span className="text-white font-bold">{character['Weapon Type'] || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-red-200 font-serif">Grade:</span>
                      <span className={`font-bold ${getRarityColor(character['Weapon Grade'])}`}>
                        {character['Weapon Grade'] || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-red-200 font-serif">Mastery:</span>
                      <span className="text-white font-bold">{character['Weapon Mastery'] || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fatal Flaw */}
            <div className="bg-gradient-to-br from-red-900/40 to-purple-900/40 rounded-2xl p-6 border border-red-500/40 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3 font-fantasy">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Skull size={16} className="text-white" />
                </div>
                Fatal Flaw
              </h4>
              <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                <p className="text-xl text-red-300 font-bold">
                  {character['Fatal Flaw'] || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-400/30 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3 font-fantasy">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                Attributes
              </h4>
              <div className="space-y-4">
                {Object.entries(stats).map(([statName, value]) => (
                  <div key={statName} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200 font-serif">{statName}:</span>
                      <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progression */}
            <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-2xl p-6 border border-amber-400/30 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3 font-fantasy">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-white" />
                </div>
                Progression
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-amber-200 font-serif text-lg">Level {character.Level || 1}</span>
                    <span className="text-white font-bold">
                      {character.XP || 0} / {levelUpThresholds[character.Level] || 'MAX'} XP
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 h-4 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min(100, (character.XP / (levelUpThresholds[character.Level] || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {character.floatingStatPoints > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-4 border border-amber-400/50">
                    <p className="text-amber-400 font-bold flex items-center gap-3 text-lg">
                      <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                        <Zap size={12} className="text-white" />
                      </div>
                      Floating Stat Points: {character.floatingStatPoints}
                    </p>
                    <p className="text-amber-200 mt-2 font-serif">
                      Available for manual allocation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSummary;