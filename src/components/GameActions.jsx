import React from 'react';
import { ScrollText, Sword, Target, Briefcase, Gem, Feather, Shield, Zap, Sparkles } from 'lucide-react';

const GameActions = ({ generateQuests, startMockCombat, setShowInventoryModal }) => {
  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Quests Section */}
      <div className="bg-gradient-to-br from-mystical-sapphire/20 to-mystical-emerald/20 rounded-2xl p-8 shadow-lg border-2 border-mystical-sapphire/50 hover:border-mystical-sapphire transition-all duration-300 group">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ScrollText size={36} className="text-mystical-sapphire group-hover:animate-magical-float" />
            <h3 className="text-3xl font-bold text-mystical-sapphire font-fantasy">Sacred Quests</h3>
            <Feather size={36} className="text-mystical-emerald group-hover:animate-magical-float" style={{animationDelay: '0.5s'}} />
          </div>
          
          <p className="text-lg text-mystical-silver mb-6 font-serif leading-relaxed">
            Embark on legendary quests to earn experience, unlock new powers, and forge your destiny across the realm.
          </p>
          
          <button
            onClick={generateQuests}
            className="px-8 py-4 bg-gradient-to-r from-mystical-sapphire to-mystical-emerald text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-mystical-sapphire/50 hover:border-mystical-emerald"
          >
            <div className="flex items-center gap-3">
              <ScrollText size={24} />
              View Available Quests
              <Sparkles size={24} className="animate-sparkle" />
            </div>
          </button>
        </div>
      </div>

      {/* Combat Section */}
      <div className="bg-gradient-to-br from-mystical-ruby/20 to-mystical-gold/20 rounded-2xl p-8 shadow-lg border-2 border-mystical-ruby/50 hover:border-mystical-ruby transition-all duration-300 group">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sword size={36} className="text-mystical-ruby group-hover:animate-magical-float" />
            <h3 className="text-3xl font-bold text-mystical-ruby font-fantasy">Combat Arena</h3>
            <Shield size={36} className="text-mystical-gold group-hover:animate-magical-float" style={{animationDelay: '0.5s'}} />
          </div>
          
          <p className="text-lg text-mystical-silver mb-6 font-serif leading-relaxed">
            Test your mettle against formidable opponents in strategic turn-based combat. Victory brings glory and treasure!
          </p>
          
          <button
            onClick={startMockCombat}
            className="px-8 py-4 bg-gradient-to-r from-mystical-ruby to-mystical-gold text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-mystical-ruby/50 hover:border-mystical-gold"
          >
            <div className="flex items-center gap-3">
              <Sword size={24} />
              Enter the Arena
              <Target size={24} className="animate-pulse" />
            </div>
          </button>
        </div>
      </div>

      {/* Inventory Section - Full Width */}
      <div className="lg:col-span-2 bg-gradient-to-br from-mystical-purple/20 to-mystical-gold/20 rounded-2xl p-8 shadow-lg border-2 border-mystical-purple/50 hover:border-mystical-purple transition-all duration-300 group">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Briefcase size={36} className="text-mystical-purple group-hover:animate-magical-float" />
            <h3 className="text-3xl font-bold text-mystical-purple font-fantasy">Treasure Vault</h3>
            <Gem size={36} className="text-mystical-gold group-hover:animate-magical-float" style={{animationDelay: '0.5s'}} />
          </div>
          
          <p className="text-lg text-mystical-silver mb-6 font-serif leading-relaxed max-w-2xl mx-auto">
            Manage your collection of mystical artifacts, powerful equipment, and precious treasures gathered throughout your adventures.
          </p>
          
          <button
            onClick={() => setShowInventoryModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-mystical-purple to-mystical-gold text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-mystical-purple/50 hover:border-mystical-gold"
          >
            <div className="flex items-center gap-3">
              <Briefcase size={24} />
              Open Treasure Vault
              <Gem size={24} className="animate-sparkle" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameActions;