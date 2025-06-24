// src/components/CharacterGenerator.jsx
import React, { useRef, useCallback } from 'react';
import { ScrollText } from 'lucide-react';
import {
  races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries,
  specialAbilityYesNo, specialAbilities, fatalFlaws, statNames, steps
} from '../gameData.js'; // Explicit .js extension
import { randomInt, weightedRandom } from '../utils/helpers.js'; // Explicit .js extension

const CharacterGenerator = ({
  characterName,
  spinning,
  setSpinning, // Added to control spinning state directly
  setCurrentSpinResult, // Now receives the setter for App's currentSpinResult state
  instruction,
  spinLabelRef, // The ref object from App.jsx
  onStartGeneration // Callback to handle character generation initiation
}) => {
  // Ref for animation frame ID, not for displaying result
  const currentSpinAnimationFrame = useRef(null);

  const animateWheel = useCallback((options, resolve) => {
    const allOptions = options.flatMap(o => Array(o.weight).fill(o.name));
    let currentDisplayIndex = 0;
    let spinDuration = randomInt(50, 80);
    let frame = 0;

    const animate = () => {
      if (frame < spinDuration) {
        const displayedResult = allOptions[currentDisplayIndex];
        
        // Directly update the DOM element for smooth animation without triggering many React renders
        if (spinLabelRef.current) { // Ensure spinLabelRef.current is a DOM element
          spinLabelRef.current.textContent = displayedResult;
          spinLabelRef.current.style.transform = `scale(1.1) rotate(${frame * 30}deg)`;
          spinLabelRef.current.style.color = `hsl(${frame * 10 % 360}, 100%, 70%)`;
        }
        currentDisplayIndex = (currentDisplayIndex + 1) % allOptions.length;
        frame++;
        currentSpinAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(currentSpinAnimationFrame.current);
        const finalResult = allOptions[randomInt(0, allOptions.length - 1)]; // Final random pick
        
        // Update the main App's state with the final result
        setCurrentSpinResult(finalResult); 
        // Directly update DOM element one last time for finality
        if (spinLabelRef.current) { // Ensure spinLabelRef.current is a DOM element
          spinLabelRef.current.textContent = finalResult;
          spinLabelRef.current.style.transform = 'scale(1.0) rotate(0deg)';
          spinLabelRef.current.style.color = '#ffd369';
          spinLabelRef.current.classList.add('animate-pop-in');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-pop-in'), 500);
        }
        resolve(finalResult);
      }
    };
    currentSpinAnimationFrame.current = requestAnimationFrame(animate);
  }, [setCurrentSpinResult, spinLabelRef]); // Add spinLabelRef to dependencies

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
        setCurrentSpinResult("All Stats Finalized!"); // Update App's state
        if (spinLabelRef.current) { // Ensure spinLabelRef.current is a DOM element
          spinLabelRef.current.textContent = "All Stats Finalized!"; // Direct DOM update
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
          setCurrentSpinResult(`${stat}: ${current}`); // Update App's state
          if (spinLabelRef.current) { // Ensure spinLabelRef.current is a DOM element
            spinLabelRef.current.textContent = `${stat}: ${current}`; // Direct DOM update
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
  }, [setCurrentSpinResult, spinLabelRef]); // Add spinLabelRef to dependencies

  const handleStartGeneration = async () => {
    // Pass the animation functions and refs to the parent's `onStartGeneration` handler
    await onStartGeneration({
      animateWheel,
      animateStats,
      setSpinning // Pass setSpinning down if character generation logic needs to manage it
    });
  };

  return (
    <>
      <p className="text-xl text-center text-purple-200 mb-6 flex items-center justify-center gap-2">
        <ScrollText size={24} className="text-pink-400" />
        {instruction}
      </p>

      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-6 text-center shadow-inner border border-gray-600 mb-8 overflow-hidden">
        {/* Attach the ref directly to the p element */}
        <p ref={spinLabelRef} className="text-5xl font-bold text-yellow-400 tracking-wide font-mono transition-all duration-75 ease-linear">
          {setCurrentSpinResult}
        </p>
      </div>

      <button
        onClick={handleStartGeneration}
        disabled={spinning || !characterName.trim()}
        className={`w-full py-4 rounded-xl text-2xl font-bold transition-all duration-300 shadow-lg
          ${spinning || !characterName.trim()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-600 to-red-700 hover:from-pink-700 hover:to-red-800 text-white transform hover:scale-105 active:scale-95'
          }`}
      >
        {spinning ? 'Spinning...' : 'Spin Character'}
      </button>
    </>
  );
};

export default CharacterGenerator;
