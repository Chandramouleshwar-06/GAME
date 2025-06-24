import React from 'react';
import { Crown, Sword, Shield, Zap, Skull, Star, TrendingUp } from 'lucide-react';
import { levelUpThresholds } from '../gameData.js';

const CharacterSummary = ({ character }) => {
  if (!character) return null;
  
  const stats = character.Stats || {};
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'Mythic': return 'text-mystical-purple';
      case 'Legendary': return 'text-mystical-gold';
      case 'Epic': return 'text-mystical-ruby';
      case 'Rare': return 'text-mystical-sapphire';
      case 'Uncommon': return 'text-mystical-emerald';
      default: return 'text-mystical-silver';
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 'SS/S+': return 'text-mystical-purple';
      case 'S': return 'text-mystical-gold';
      case 'A': return 'text-mystical-ruby';
      case 'B': return 'text-mystical-sapphire';
      case 'C': return 'text-mystical-emerald';
      default: return 'text-mystical-silver';
    }
  };

  return (
    <div className="bg-gradient-to-br from-fantasy-dark via-gray-900 to-fantasy-dark rounded-2xl shadow-2xl border-2 border-mystical-gold/50 p-8 backdrop-blur-sm">
      {/* Character Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown size={40} className="text-mystical-gold animate-glow" />
          <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-mystical-gold to-mystical-silver bg-clip-text font-fantasy">
            {character.name || 'Unnamed Hero'}
          </h3>
          <Crown size={40} className="text-mystical-gold animate-glow" />
        </div>
        
        {/* Nexus Rating & Rank */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="bg-gradient-to-r from-mystical-purple/20 to-fantasy-magic/20 rounded-xl p-4 border border-mystical-purple/50">
            <p className="text-sm text-mystical-silver mb-1">Nexus Rating</p>
            <p className="text-3xl font-bold text-mystical-gold">{character['Nexus Rating'] || 'N/A'}</p>
          </div>
          <div className="bg-gradient-to-r from-mystical-gold/20 to-mystical-silver/20 rounded-xl p-4 border border-mystical-gold/50">
            <p className="text-sm text-mystical-silver mb-1">Nexus Rank</p>
            <p className={`text-3xl font-bold ${getRankColor(character['Nexus Rank'])}`}>
              {character['Nexus Rank'] || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Character Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-mystical-emerald/10 to-mystical-sapphire/10 rounded-xl p-6 border border-mystical-emerald/30">
            <h4 className="text-xl font-bold text-mystical-gold mb-4 flex items-center gap-2 font-fantasy">
              <Star size={24} />
              Heritage & Abilities
            </h4>
            <div className="space-y-3">
              <p className="text-lg text-mystical-silver">
                <strong className="text-mystical-gold">Race:</strong> {character.Race || 'N/A'}
              </p>
              <p className="text-lg text-mystical-silver">
                <strong className="text-mystical-gold">Racial Ability:</strong> {character.Ability || 'N/A'}
              </p>
              <p className="text-lg text-mystical-silver">
                <strong className="text-mystical-gold">Special Power:</strong> {character['Special Ability'] || 'None'}
              </p>
            </div>
          </div>

          {/* Weapon Info */}
          <div className="bg-gradient-to-r from-mystical-ruby/10 to-mystical-gold/10 rounded-xl p-6 border border-mystical-ruby/30">
            <h4 className="text-xl font-bold text-mystical-gold mb-4 flex items-center gap-2 font-fantasy">
              <Sword size={24} />
              Arsenal
            </h4>
            <div className="space-y-3">
              <p className="text-lg text-mystical-silver">
                <strong className="text-mystical-gold">Armed:</strong> {character['Weapon Yes/No'] || 'N/A'}
              </p>
              {character['Weapon Yes/No'] === 'Yes' && (
                <div className="ml-4 space-y-2 border-l-2 border-mystical-gold/30 pl-4">
                  <p className="text-mystical-silver">
                    <strong className="text-mystical-gold">Type:</strong> {character['Weapon Type'] || 'N/A'}
                  </p>
                  <p className="text-mystical-silver">
                    <strong className="text-mystical-gold">Grade:</strong> 
                    <span className={getRarityColor(character['Weapon Grade'])}> {character['Weapon Grade'] || 'N/A'}</span>
                  </p>
                  <p className="text-mystical-silver">
                    <strong className="text-mystical-gold">Mastery:</strong> {character['Weapon Mastery'] || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fatal Flaw */}
          <div className="bg-gradient-to-r from-red-900/20 to-mystical-purple/20 rounded-xl p-6 border border-red-500/30">
            <h4 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2 font-fantasy">
              <Skull size={24} />
              Fatal Flaw
            </h4>
            <p className="text-lg text-mystical-silver">
              {character['Fatal Flaw'] || 'N/A'}
            </p>
          </div>
        </div>

        {/* Stats & Progression */}
        <div className="space-y-6">
          
          {/* Stats */}
          <div className="bg-gradient-to-r from-mystical-purple/10 to-mystical-gold/10 rounded-xl p-6 border border-mystical-purple/30">
            <h4 className="text-xl font-bold text-mystical-gold mb-4 flex items-center gap-2 font-fantasy">
              <Shield size={24} />
              Attributes
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(stats).map(([statName, value]) => (
                <div key={statName} className="flex justify-between items-center">
                  <span className="text-mystical-silver font-serif">{statName}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-mystical-gold to-mystical-silver h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-mystical-gold font-bold w-8 text-right">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progression */}
          <div className="bg-gradient-to-r from-mystical-emerald/10 to-mystical-sapphire/10 rounded-xl p-6 border border-mystical-emerald/30">
            <h4 className="text-xl font-bold text-mystical-gold mb-4 flex items-center gap-2 font-fantasy">
              <TrendingUp size={24} />
              Progression
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-mystical-silver font-serif">Level {character.Level || 1}</span>
                  <span className="text-mystical-gold font-bold">
                    {character.XP || 0} / {levelUpThresholds[character.Level] || 'MAX'} XP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-mystical-emerald to-mystical-sapphire h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (character.XP / (levelUpThresholds[character.Level] || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {character.floatingStatPoints > 0 && (
                <div className="bg-mystical-gold/20 rounded-lg p-3 border border-mystical-gold/50">
                  <p className="text-mystical-gold font-bold flex items-center gap-2">
                    <Zap size={20} />
                    Floating Stat Points: {character.floatingStatPoints}
                  </p>
                  <p className="text-sm text-mystical-silver mt-1">
                    Available for manual allocation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSummary;