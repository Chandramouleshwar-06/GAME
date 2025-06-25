import React from 'react';
import { ScrollText, Sword, Target, Briefcase, Gem, Feather, Shield, Zap, Sparkles, Crown, Star } from 'lucide-react';

const GameActions = ({ generateQuests, startMockCombat, setShowInventoryModal }) => {
  return (
    <div className="mt-16 space-y-8">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <h3 className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-fantasy mb-4">
          Choose Your Path
        </h3>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Quests Section */}
        <div className="group bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-3xl p-8 shadow-2xl border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
          
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <ScrollText size={32} className="text-white" />
              </div>
              <h4 className="text-3xl font-bold text-blue-400 font-fantasy">Sacred Quests</h4>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Feather size={32} className="text-white animate-pulse" />
              </div>
            </div>
            
            <p className="text-lg text-blue-100 mb-8 font-serif leading-relaxed">
              Embark on legendary quests to earn experience, unlock new powers, and forge your destiny across the realm.
            </p>
            
            <button
              onClick={generateQuests}
              className="group/btn px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-blue-400/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <ScrollText size={24} />
                View Available Quests
                <Sparkles size={24} className="animate-pulse" />
              </div>
            </button>
          </div>
        </div>

        {/* Combat Section */}
        <div className="group bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-3xl p-8 shadow-2xl border border-red-400/30 hover:border-red-400/60 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
          
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Sword size={32} className="text-white" />
              </div>
              <h4 className="text-3xl font-bold text-red-400 font-fantasy">Combat Arena</h4>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Shield size={32} className="text-white animate-pulse" />
              </div>
            </div>
            
            <p className="text-lg text-red-100 mb-8 font-serif leading-relaxed">
              Test your mettle against formidable opponents in strategic turn-based combat. Victory brings glory and treasure!
            </p>
            
            <button
              onClick={startMockCombat}
              className="group/btn px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-red-400/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <Sword size={24} />
                Enter the Arena
                <Target size={24} className="animate-pulse" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Section - Full Width */}
      <div className="group bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-8 shadow-2xl border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
        
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Briefcase size={32} className="text-white" />
            </div>
            <h4 className="text-3xl font-bold text-purple-400 font-fantasy">Treasure Vault</h4>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Gem size={32} className="text-white animate-pulse" />
            </div>
          </div>
          
          <p className="text-lg text-purple-100 mb-8 font-serif leading-relaxed max-w-3xl mx-auto">
            Manage your collection of mystical artifacts, powerful equipment, and precious treasures gathered throughout your adventures.
          </p>
          
          <button
            onClick={() => setShowInventoryModal(true)}
            className="group/btn px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-purple-400/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <Briefcase size={24} />
              Open Treasure Vault
              <Gem size={24} className="animate-pulse" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameActions;