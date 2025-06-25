import React, { useRef, useCallback } from 'react';
import { ScrollText, Sparkles, Wand2, Crown } from 'lucide-react';
import {
  races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries,
  specialAbilityYesNo, specialAbilities, fatalFlaws, statNames, steps
} from '../gameData.js';
import { randomInt, weightedRandom } from '../utils/helpers.js';

const CharacterGenerator = ({
  characterName,
  spinning,
  setSpinning,
  setCurrentSpinResult,
  instruction,
  spinLabelRef,
  onStartGeneration
}) => {
  const currentSpinAnimationFrame = useRef(null);

  const animateWheel = useCallback((options, resolve) => {
    const allOptions = options.flatMap(o => Array(o.weight).fill(o.name));
    let currentDisplayIndex = 0;
    let spinDuration = randomInt(50, 80);
    let frame = 0;

    const animate = () => {
      if (frame < spinDuration) {
        const displayedResult = allOptions[currentDisplayIndex];
        
        if (spinLabelRef.current) {
          spinLabelRef.current.textContent = displayedResult;
          spinLabelRef.current.style.transform = `scale(1.1) rotate(${frame * 30}deg)`;
          spinLabelRef.current.style.color = `hsl(${frame * 10 % 360}, 100%, 70%)`;
          spinLabelRef.current.style.textShadow = `0 0 ${10 + frame % 20}px rgba(255, 215, 0, 0.8)`;
        }
        currentDisplayIndex = (currentDisplayIndex + 1) % allOptions.length;
        frame++;
        currentSpinAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(currentSpinAnimationFrame.current);
        const finalResult = allOptions[randomInt(0, allOptions.length - 1)];
        
        setCurrentSpinResult(finalResult);
        if (spinLabelRef.current) {
          spinLabelRef.current.textContent = finalResult;
          spinLabelRef.current.style.transform = 'scale(1.0) rotate(0deg)';
          spinLabelRef.current.style.color = '#FFD700';
          spinLabelRef.current.style.textShadow = '0 0 20px rgba(255, 215, 0, 1)';
          spinLabelRef.current.classList.add('animate-bounce');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-bounce'), 500);
        }
        resolve(finalResult);
      }
    };
    currentSpinAnimationFrame.current = requestAnimationFrame(animate);
  }, [setCurrentSpinResult, spinLabelRef]);

  const animateStats = useCallback((currentCharacter, resolveStep) => {
    let statTargets = {};
    let count90Plus = 0;
    for (const stat of statNames) {
      let base = randomInt(20, 100);
      if (count90Plus >= 1 && base >= 90) {
        base = randomInt(20, 89);
      }
      if (base >= 90) {
        count90Plus++;
      }
      statTargets[stat] = base;
    }

    let currentStats = { ...currentCharacter?.Stats || {} };
    let animatedStatIndex = 0;

    const animateSingleStat = () => {
      if (animatedStatIndex >= statNames.length) {
        currentCharacter.Stats = currentStats;
        setCurrentSpinResult("All Stats Forged!");
        if (spinLabelRef.current) {
          spinLabelRef.current.textContent = "All Stats Forged!";
          spinLabelRef.current.style.color = '#FFD700';
          spinLabelRef.current.style.textShadow = '0 0 25px rgba(255, 215, 0, 1)';
          spinLabelRef.current.classList.add('animate-bounce');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-bounce'), 500);
        }
        resolveStep(currentCharacter);
        return;
      }

      const stat = statNames[animatedStatIndex];
      const target = statTargets[stat];
      let current = currentStats[stat] || 0;

      const updateStatVisual = () => {
        if (current < target) {
          current += randomInt(2, 6);
          if (current > target) current = target;
          currentStats[stat] = current;
          setCurrentSpinResult(`${stat}: ${current}`);
          if (spinLabelRef.current) {
            spinLabelRef.current.textContent = `${stat}: ${current}`;
            spinLabelRef.current.style.color = `hsl(${(current / 100) * 120}, 100%, 70%)`;
            spinLabelRef.current.style.textShadow = `0 0 15px rgba(255, 215, 0, 0.8)`;
          }
          currentSpinAnimationFrame.current = setTimeout(updateStatVisual, 60);
        } else {
          cancelAnimationFrame(currentSpinAnimationFrame.current);
          animatedStatIndex++;
          currentSpinAnimationFrame.current = setTimeout(animateSingleStat, 200);
        }
      };
      currentSpinAnimationFrame.current = setTimeout(updateStatVisual, 60);
    };

    animateSingleStat();
  }, [setCurrentSpinResult, spinLabelRef]);

  const handleStartGeneration = async () => {
    await onStartGeneration({
      animateWheel,
      animateStats,
      setSpinning
    });
  };

  return (
    <div className="space-y-8">
      {/* Instruction Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <ScrollText size={24} className="text-white" />
          </div>
          <p className="text-2xl lg:text-3xl text-amber-200 font-serif italic">
            {instruction}
          </p>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
            <Wand2 size={24} className="text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Fate Wheel */}
      <div className="bg-gradient-to-br from-slate-800/50 via-purple-900/30 to-slate-800/50 rounded-3xl p-12 text-center shadow-2xl border border-amber-500/30 backdrop-blur-sm relative overflow-hidden">
        {/* Magical background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
        
        <div className="relative z-10">
          {/* Decorative elements */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
              <Sparkles size={32} className="text-white animate-spin-slow" />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-amber-400 font-fantasy mb-2">Wheel of Destiny</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl">
              <Crown size={32} className="text-white animate-pulse" />
            </div>
          </div>
          
          {/* Main display */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-2xl p-8 border border-amber-400/50 shadow-inner mb-8">
            <p ref={spinLabelRef} className="text-5xl lg:text-6xl font-bold text-amber-400 tracking-wide font-fantasy transition-all duration-75 ease-linear min-h-[80px] flex items-center justify-center drop-shadow-lg">
              {spinning ? "✨ Weaving Fate ✨" : "Ready to Begin"}
            </p>
          </div>
          
          {/* Decorative sparkles */}
          <div className="flex justify-center gap-4">
            <Sparkles size={24} className="text-purple-400 animate-pulse" />
            <Sparkles size={32} className="text-amber-400 animate-pulse" style={{animationDelay: '0.5s'}} />
            <Sparkles size={24} className="text-blue-400 animate-pulse" style={{animationDelay: '1s'}} />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleStartGeneration}
          disabled={spinning || !characterName.trim()}
          className={`group px-12 py-6 rounded-2xl text-3xl font-bold transition-all duration-300 shadow-2xl font-fantasy border-2 relative overflow-hidden transform hover:scale-105 active:scale-95
            ${spinning || !characterName.trim()
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed border-slate-500 shadow-none'
              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-white border-amber-400 shadow-amber-500/50 hover:shadow-amber-400/75'
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-center justify-center gap-4">
            {spinning ? (
              <>
                <Wand2 size={36} className="animate-spin" />
                Forging Your Destiny...
                <Sparkles size={36} className="animate-pulse" />
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                Begin Your Legend
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Wand2 size={24} className="animate-pulse" style={{animationDelay: '0.5s'}} />
                </div>
              </>
            )}
          </div>
          
          {/* Shimmer effect */}
          {!spinning && !(!characterName.trim()) && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default CharacterGenerator;