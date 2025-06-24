import React, { useRef, useCallback } from 'react';
import { ScrollText, Sparkles, Wand2 } from 'lucide-react';
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
          spinLabelRef.current.classList.add('animate-pop-in');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-pop-in'), 500);
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
          spinLabelRef.current.classList.add('animate-pop-in');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-pop-in'), 500);
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
    <>
      <div className="text-center mb-8">
        <p className="text-2xl text-mystical-silver mb-6 flex items-center justify-center gap-3 font-serif">
          <ScrollText size={28} className="text-mystical-gold animate-magical-float" />
          {instruction}
          <Wand2 size={28} className="text-mystical-purple animate-magical-float" style={{animationDelay: '1s'}} />
        </p>
      </div>

      <div className="bg-gradient-to-br from-fantasy-dark via-mystical-purple/20 to-fantasy-dark rounded-3xl p-8 text-center shadow-inner border-2 border-mystical-gold/30 mb-8 overflow-hidden relative">
        {/* Magical background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mystical-gold/10 to-transparent animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="mb-4">
            <Sparkles size={32} className="text-mystical-gold mx-auto animate-sparkle" />
          </div>
          
          <p ref={spinLabelRef} className="text-6xl font-bold text-mystical-gold tracking-wide font-fantasy transition-all duration-75 ease-linear min-h-[80px] flex items-center justify-center animate-glow">
            {spinning ? "✨ Weaving Fate ✨" : "Ready to Begin"}
          </p>
          
          <div className="mt-4">
            <Sparkles size={24} className="text-mystical-silver mx-auto animate-sparkle" style={{animationDelay: '1s'}} />
          </div>
        </div>
      </div>

      <button
        onClick={handleStartGeneration}
        disabled={spinning || !characterName.trim()}
        className={`w-full py-6 rounded-xl text-3xl font-bold transition-all duration-300 shadow-lg font-fantasy border-2 relative overflow-hidden
          ${spinning || !characterName.trim()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-500'
            : 'bg-gradient-to-r from-mystical-purple via-fantasy-magic to-mystical-purple hover:from-mystical-gold hover:via-mystical-silver hover:to-mystical-gold text-white transform hover:scale-105 active:scale-95 border-mystical-gold shadow-mystical-gold/50 hover:shadow-xl'
          }`}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {spinning ? (
            <>
              <Wand2 size={32} className="animate-spin" />
              Forging Your Destiny...
              <Sparkles size={32} className="animate-pulse" />
            </>
          ) : (
            <>
              <Sparkles size={32} className="animate-magical-float" />
              Begin Your Legend
              <Wand2 size={32} className="animate-magical-float" style={{animationDelay: '0.5s'}} />
            </>
          )}
        </div>
        
        {!spinning && !(!characterName.trim()) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] animate-pulse"></div>
        )}
      </button>
    </>
  );
};

export default CharacterGenerator;