import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, getDocs } from 'firebase/firestore'; // Added 'query' and 'getDocs'
import { Sparkles, Sword, BookOpen, ScrollText, Feather, Target, Briefcase } from 'lucide-react'; // Removed unused icons like Gem, Shield, Heart, Hourglass

// Import game data and utility functions from their respective files
import { races, abilities, steps, levelUpThresholds, nexusRankThresholds, questTemplates, fatalFlaws, statNames, specialAbilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, weaponMasteryValues, specialAbilityNexusValues, itemTypes } from './data/gameData';
import { randomInt, weightedRandom, calculateNexusRating, calculateMaxHP, generateAIOpponent, generateWeightedRewards } from './utils/gameUtils';

// Import separated components
import CharacterSummary from './components/CharacterSummary';
import CombatArena from './components/CombatArena';
import InventoryModal from './components/InventoryModal';
import QuestsModal from './components/QuestsModal';
import RankingsModal from './components/RankingsModal';


// Firebase configuration - MANDATORY: For local development, replace these with YOUR ACTUAL Firebase project config
const appId = 'your-unique-app-id-for-local-dev'; // Can be any string for local development
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // PASTE YOUR ACTUAL API KEY HERE
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // PASTE YOUR ACTUAL AUTH DOMAIN HERE
  projectId: "YOUR_PROJECT_ID", // PASTE YOUR ACTUAL PROJECT ID HERE
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // PASTE YOUR ACTUAL STORAGE BUCKET HERE
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // PASTE YOUR ACTUAL MESSAGING SENDER ID HERE
  appId: "YOUR_APP_ID_FROM_FIREBASE_WEB_APP_CONFIG" // PASTE YOUR ACTUAL APP ID HERE
};
const initialAuthToken = null; // Leave null for anonymous sign-in, or provide a custom token if using advanced auth.

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


const App = () => {
  // State definitions - ALL useState hooks at the very top
  const [userId, setUserId] = useState(null);
  const [character, setCharacter] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentSpinResult, setCurrentSpinResult] = useState('');
  const [instruction, setInstruction] = useState("Enter your character's name and click 'Spin Race'.");
  const [showGenerationComplete, setShowGenerationComplete] = useState(false);
  const [showRankingsModal, setShowRankingsModal] = useState(false);
  const [allRankings, setAllRankings] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [availableQuests, setAvailableQuests] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [combatants, setCombatants] = useState({ player: null, opponent: null });


  // Refs for interactive spinning
  const spinLabelRef = useRef(null);
  const currentSpinAnimationFrame = useRef(null);

  // --- Callback Functions (All defined before JSX return) ---

  // Firebase related callbacks
  const saveCharacter = useCallback(async (charData) => {
    if (!userId) {
      console.error("User not authenticated. Cannot save character.");
      alert("Please wait for authentication to complete before saving.");
      return;
    }
    try {
      const charDocRef = doc(db, `artifacts/${appId}/users/${userId}/characters`, 'mainCharacter');
      await setDoc(charDocRef, charData);
      console.log("Character saved successfully!");
    } catch (e) {
      console.error("Error saving character:", e);
      alert("Error saving character. Please try again.");
    }
  }, [userId]); // appId is a constant, no need in deps

  // Reward System Functions
  const gainXP = useCallback((amount) => {
    if (!character) return;
    setCharacter(prevChar => {
      let newXP = prevChar.XP + amount;
      let newLevel = prevChar.Level;

      const nextLevelXP = levelUpThresholds[newLevel]; // Correctly accessed from imported constant
      if (nextLevelXP && newXP >= nextLevelXP) {
        newLevel++;
        newXP -= nextLevelXP; // Carry over excess XP
        alert(`Congratulations! You reached Level ${newLevel}!`);
      }

      const updatedChar = { ...prevChar, XP: newXP, Level: newLevel };
      saveCharacter(updatedChar);
      return updatedChar;
    });
  }, [character, saveCharacter]); // levelUpThresholds is a constant, no need in deps

  const applyStatGain = useCallback((statName, value) => {
    if (!character) return;
    setCharacter(prevChar => {
      const newStats = { ...prevChar.Stats };
      let floatingPointsGained = 0;

      const currentStat = newStats[statName] || 0;
      let finalStatValue = currentStat + value;

      if (finalStatValue > 90) {
        floatingPointsGained = finalStatValue - 90;
        finalStatValue = 90;
        alert(`Your ${statName} reached 90! You gained ${floatingPointsGained} floating stat points.`);
      } else {
        alert(`Your ${statName} increased to ${finalStatValue}!`);
      }

      newStats[statName] = finalStatValue;

      const updatedChar = {
        ...prevChar,
        Stats: newStats,
        floatingStatPoints: (prevChar.floatingStatPoints || 0) + floatingPointsGained
      };
      const finalChar = calculateNexusRating(updatedChar); // calculateNexusRating is from gameUtils, external constant
      saveCharacter(finalChar);
      return finalChar;
    });
  }, [character, saveCharacter]);

  const addItemToInventory = useCallback((itemToAdd) => {
    if (!character) return;
    setCharacter(prevChar => {
      const newInventory = [...(prevChar.inventory || [])];
      let itemAdded = false;

      if (itemToAdd.rarity === "Mythic") {
        const existingMythic = newInventory.some(item => item.name === itemToAdd.name && item.rarity === "Mythic");
        if (existingMythic) {
          alert(`You already possess the Mythic item: ${itemToAdd.name}. Cannot acquire duplicates.`);
          return prevChar;
        }
      }

      if (itemToAdd.stackable) {
        const existingItemIndex = newInventory.findIndex(i => i.name === itemToAdd.name && i.type === itemToAdd.type);
        if (existingItemIndex !== -1) {
          newInventory[existingItemIndex].quantity = (newInventory[existingItemIndex].quantity || 1) + (itemToAdd.quantity || 1);
          itemAdded = true;
        }
      }

      if (!itemAdded) {
        newInventory.push({ ...itemToAdd, quantity: itemToAdd.quantity || 1 });
      }

      const updatedChar = { ...prevChar, inventory: newInventory };
      saveCharacter(updatedChar);
      alert(`You received: ${itemToAdd.name}${itemToAdd.quantity > 1 && itemToAdd.stackable ? ` (x${itemToAdd.quantity})` : ''}!`);
      return updatedChar;
    });
  }, [character, saveCharacter]);

  // Modals close callbacks
  const closeRankingsModal = useCallback(() => setShowRankingsModal(false), []);
  const closeQuestsModal = useCallback(() => setShowQuestsModal(false), []);
  const closeInventoryModal = useCallback(() => setShowInventoryModal(false), []);
  const closeCombatModal = useCallback(() => {
    setShowCombatModal(false);
    setCombatants({ player: null, opponent: null });
  }, []);

  // Callback to update quest progress from CombatArena or other activities
  const updateQuestProgress = useCallback((questId, progressType, value) => {
    setCharacter(prevChar => {
      if (!prevChar || !prevChar.activeQuest || prevChar.activeQuest.id !== questId) {
        return prevChar;
      }

      const updatedProgress = { ...prevChar.activeQuest.currentProgress };
      let questCompleted = false;

      if (progressType === "wins") {
        updatedProgress.currentWins = (updatedProgress.currentWins || 0) + value;
        if (prevChar.activeQuest.type === "Battle Quest" && updatedProgress.currentWins >= prevChar.activeQuest.specifics.winsRequired) {
          questCompleted = true;
        }
      }
      // Add other progress types (e.g., rounds for exploration)

      if (questCompleted) {
        alert(`Quest "${prevChar.activeQuest.name}" completed!`);
        const rewards = prevChar.activeQuest.rewards;
        if (rewards.xp) gainXP(rewards.xp);
        if (rewards.item) addItemToInventory(rewards.item);
        if (rewards.stat && rewards.value) applyStatGain(rewards.stat, rewards.value);
        // More reward types to be handled here

        return { ...prevChar, activeQuest: null };
      } else {
        const updatedActiveQuest = { ...prevChar.activeQuest, currentProgress: updatedProgress };
        saveCharacter({ ...prevChar, activeQuest: updatedActiveQuest });
        return { ...prevChar, activeQuest: updatedActiveQuest };
      }
    });
  }, [character, gainXP, addItemToInventory, applyStatGain, saveCharacter]);


  // Combat related callbacks
  const startMockCombat = useCallback(() => {
    if (!character) {
      alert("Please generate a character first!");
      return;
    }
    const opponent = generateAIOpponent(character["Nexus Rank"]); // generateAIOpponent is from gameUtils, external constant
    const playerWithHP = { ...character, currentHP: calculateMaxHP(character.Stats?.Durability || 0), maxHP: calculateMaxHP(character.Stats?.Durability || 0) }; // calculateMaxHP is from gameUtils, external constant

    setCombatants({ player: playerWithHP, opponent: opponent });
    setShowCombatModal(true);
  }, [character]);


  const handleCombatEnd = useCallback((winner, winningChar) => {
    let message = "";
    if (winner === 'player') {
      message = `Victory! You defeated ${winningChar.name}!`;
      const xpReward = randomInt(character.Level * 10, character.Level * 20);
      gainXP(xpReward);
      const rewards = generateWeightedRewards(character.Level, randomInt(1, 4));
      rewards.forEach(item => addItemToInventory(item));
      message += ` You gained ${xpReward} XP and some loot!`;

      if (activeQuest && activeQuest.type === "Battle Quest" && activeQuest.specifics.enemyType === winningChar.Race) {
        updateQuestProgress(activeQuest.id, "wins", 1);
      }

    } else {
      message = `Defeat! You were knocked out by ${winningChar.name}.`;
      const penaltyXP = Math.round((randomInt(character.Level * 10, character.Level * 20)) / 4);
      gainXP(-penaltyXP);
      message += ` You lost ${penaltyXP} XP.`;
    }
    alert(message);
    closeCombatModal();
  }, [gainXP, addItemToInventory, closeCombatModal, character, activeQuest, updateQuestProgress]);


  // Quests related callbacks
  const generateQuests = useCallback(async () => {
    if (!character) {
      setAvailableQuests([]);
      return;
    }

    if (activeQuest) {
      setShowQuestsModal(true);
      return;
    }

    const charRank = character["Nexus Rank"];
    const charRating = character["Nexus Rating"];
    const currentRankThreshold = nexusRankThresholds[charRank]; // nexusRankThresholds is a constant

    const sortedRanks = Object.entries(nexusRankThresholds).sort(([, a], [, b]) => a - b);
    let nextRank = null;
    let nextRankThreshold = null;
    let foundCurrent = false;
    for (const [rankName, threshold] of sortedRanks) {
        if (foundCurrent && threshold > currentRankThreshold) {
            nextRank = rankName;
            nextRankThreshold = threshold;
            break;
        }
        if (rankName === charRank) {
            foundCurrent = true;
        }
    }

    const quests = [];

    if (nextRank && charRating >= nextRankThreshold) {
      quests.push({
        id: "rank_up_quest",
        type: "Rank Up Quest",
        name: `Ascension Trial: Prove Your Rank to ${nextRank}`,
        description: `Complete a special challenge to ascend to Nexus Rank ${nextRank}!`,
        rankRequired: charRank,
        rewards: { rank: nextRank, xp: 200 },
        specifics: { type: "rank_up", targetRank: nextRank }
      });
    }

    const eligibleQuests = questTemplates.filter(q => { // questTemplates is a constant
        const questRankThreshold = nexusRankThresholds[q.rankRequired];
        return charRating >= questRankThreshold;
    });

    while (quests.length < 3 && eligibleQuests.length > 0) {
      const randomIndex = randomInt(0, eligibleQuests.length - 1);
      const chosenQuest = eligibleQuests.splice(randomIndex, 1)[0];

      let description = chosenQuest.description;
      if (chosenQuest.specifics) {
          for (const key in chosenQuest.specifics) {
              if (description.includes(`{${key}}`)) {
                description = description.replace(`{${key}}`, chosenQuest.specifics[key]);
              }
          }
      }
      if (chosenQuest.costs) {
        let costDescription = Object.entries(chosenQuest.costs).map(([resource, val]) => `${val} ${resource}`).join(', ');
        description += ` (Cost: ${costDescription})`;
      }
      quests.push({ ...chosenQuest, description });
    }

    setAvailableQuests(quests);
    setShowQuestsModal(true);
  }, [character, activeQuest]); // nexusRankThresholds, questTemplates are constants, no need in deps


  const acceptQuest = useCallback((quest) => {
    if (activeQuest) {
      alert("You already have an active quest. Complete or abandon it first!");
      return;
    }
    const newActiveQuest = { ...quest, currentProgress: quest.progress || {} };
    setActiveQuest(newActiveQuest);
    setCharacter(prevChar => {
      const updatedChar = { ...prevChar, activeQuest: newActiveQuest };
      saveCharacter(updatedChar);
      return updatedChar;
    });
    alert(`Quest "${quest.name}" accepted!`);
    setShowQuestsModal(false);
  }, [activeQuest, character, saveCharacter]);

  const abandonQuest = useCallback(() => {
    if (!activeQuest) return;

    const penaltyXP = Math.round((activeQuest.rewards.xp || 0) / 4);
    gainXP(-penaltyXP);

    alert(`Quest "${activeQuest.name}" abandoned. You lost ${penaltyXP} XP as a penalty.`);
    setActiveQuest(null);
    setCharacter(prevChar => {
      const updatedChar = { ...prevChar, activeQuest: null };
      saveCharacter(updatedChar);
      return updatedChar;
    });
    setShowQuestsModal(false);
  }, [activeQuest, gainXP, character, saveCharacter]);


  // Character Generation Spin Animations
  const animateWheel = useCallback((options, stepName, currentCharacter, resolve) => {
    const allOptions = options.flatMap(o => Array(o.weight).fill(o.name));
    let currentDisplayIndex = 0;
    let spinDuration = randomInt(50, 80);
    let frame = 0;

    const animate = () => {
      if (frame < spinDuration) {
        setCurrentSpinResult(allOptions[currentDisplayIndex]);
        if (spinLabelRef.current) {
          spinLabelRef.current.style.transform = `scale(1.1) rotate(${frame * 30}deg)`;
          spinLabelRef.current.style.color = `hsl(${frame * 10 % 360}, 100%, 70%)`;
        }
        currentDisplayIndex = (currentDisplayIndex + 1) % allOptions.length;
        frame++;
        currentSpinAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(currentSpinAnimationFrame.current);
        const finalResult = allOptions[randomInt(0, allOptions.length - 1)];
        setCurrentSpinResult(finalResult);
        if (spinLabelRef.current) {
          spinLabelRef.current.style.transform = 'scale(1.0) rotate(0deg)';
          spinLabelRef.current.style.color = '#ffd369';
          spinLabelRef.current.classList.add('animate-pop-in');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-pop-in'), 500);
        }
        resolve(finalResult);
      }
    };
    currentSpinAnimationFrame.current = requestAnimationFrame(animate);
  }, []); // randomInt is external, no need in deps

  const animateStats = useCallback((currentCharacter, stepIndex, resolveStep) => {
    let statTargets = {};
    let count90Plus = 0;
    for (const stat of statNames) { // statNames is a constant
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
      if (animatedStatIndex >= statNames.length) { // statNames is a constant
        currentCharacter.Stats = currentStats;
        setCurrentSpinResult("All Stats Finalized!");
        if (spinLabelRef.current) {
          spinLabelRef.current.classList.add('animate-pop-in');
          setTimeout(() => spinLabelRef.current.classList.remove('animate-pop-in'), 500);
        }
        resolveStep(currentCharacter);
        return;
      }

      const stat = statNames[animatedStatIndex]; // statNames is a constant
      const target = statTargets[stat];
      let current = currentStats[stat] || 0;

      const updateStatVisual = () => {
        if (current < target) {
          current += randomInt(2, 6);
          if (current > target) current = target;
          currentStats[stat] = current;
          setCurrentSpinResult(`${stat}: ${current}`);
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
  }, []); // randomInt is external, statNames is constant, no need in deps


  const startSpin = useCallback(async () => {
    if (spinning || !userId) {
      console.warn("Already spinning or user not authenticated.");
      return;
    }

    if (character) {
      alert("You already have a character! You must grind with your current one.");
      return;
    }

    if (!characterName.trim()) {
      alert("Please enter a character name before spinning.");
      return;
    }

    setSpinning(true);
    let selected = { name: characterName.trim(), XP: 0, Level: 1, inventory: [], floatingStatPoints: 0, activeQuest: null };

    for (let i = 0; i < steps.length; i++) { // steps is a constant
      const step = steps[i];
      setInstruction(`Spinning ${step}...`);

      let result = null;

      if (step === "Stats") {
        await new Promise(resolve => animateStats(selected, i, (updatedChar) => {
          selected = updatedChar;
          resolve();
        }));
        continue;
      }

      if ((step === "Weapon Type" || step === "Weapon Grade" || step === "Weapon Mastery") && selected["Weapon Yes/No"] === "No") {
        selected[step] = "None";
        setInstruction(`${step} skipped.`);
        setCurrentSpinResult("Skipped");
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      if (step === "Special Ability" && selected["Special Ability Yes/No"] === "No") {
        selected[step] = "None";
        setInstruction(`${step} skipped.`);
        setCurrentSpinResult("Skipped");
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      let options = [];
      switch (step) {
        case "Race": options = races; break;
        case "Ability": options = abilities[selected.Race] ? abilities[selected.Race].map(a => ({ name: a, weight: 1 })) : [{ name: "No Ability", weight: 1 }]; break;
        case "Weapon Yes/No": options = weaponYesNo; break;
        case "Weapon Type": options = weaponTypes; break;
        case "Weapon Grade": options = weaponGrades; break;
        case "Weapon Mastery": options = weaponMasteries; break;
        case "Special Ability Yes/No": options = specialAbilityYesNo; break;
        case "Special Ability": options = specialAbilities; break;
        case "Fatal Flaw": options = fatalFlaws.map(f => ({ name: f.name, weight: 1 })); break;
        default: break;
      }

      const result = await new Promise(resolve => animateWheel(options, step, selected, resolve));
      selected[step] = result;
      setCurrentSpinResult(result);
      setInstruction(`${step} selected: ${result}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const finalCharacter = calculateNexusRating(selected);
    setCharacter(finalCharacter);
    saveCharacter(finalCharacter);
    setShowGenerationComplete(true);
    setInstruction("Character generation complete! Review your character below.");
    setSpinning(false);
    setCurrentStepIndex(steps.length);
  }, [spinning, userId, character, characterName, animateStats, animateWheel, saveCharacter]);


  const handleSpinClick = useCallback(() => {
    if (character) {
      alert("You already have a character. You cannot generate a new one.");
      return;
    }
    setCurrentStepIndex(0);
    startSpin();
  }, [character, startSpin]);

  const showAllRankings = useCallback(async () => {
    if (!isAuthReady) {
      alert("Authentication not ready. Please wait.");
      return;
    }
    try {
      // Correctly import collection and query from firebase/firestore
      const { collection, query, getDocs } = await import('firebase/firestore'); // Moved dynamic import here
      const charactersCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/characters`);
      const q = query(charactersCollectionRef);
      const querySnapshot = await getDocs(q);

      const rankings = [];
      querySnapshot.forEach((doc) => {
        rankings.push(doc.data());
      });

      rankings.sort((a, b) => (b["Nexus Rating"] || 0) - (a["Nexus Rating"] || 0));
      setAllRankings(rankings);
      setShowRankingsModal(true);
    }
    catch (e) {
      console.error("Error fetching rankings:", e);
      alert("Error fetching rankings.");
    }
  }, [userId, isAuthReady]);


  // Modals close callbacks (already defined above)
  const closeRankingsModal = useCallback(() => setShowRankingsModal(false), []);
  const closeQuestsModal = useCallback(() => setShowQuestsModal(false), []);
  const closeInventoryModal = useCallback(() => setShowInventoryModal(false), []);
  const closeCombatModal = useCallback(() => {
    setShowCombatModal(false);
    setCombatants({ player: null, opponent: null });
  }, []);

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-950 text-gray-100 font-inter p-4 sm:p-8 flex flex-col items-center justify-center">
      <style>
        {`
        @keyframes pulse-light {
          0%, 100% { opacity: 1; text-shadow: 0 0 5px rgba(255,215,0,0.5); }
          50% { opacity: 0.8; text-shadow: 0 0 15px rgba(255,215,0,1); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pulse-light {
          animation: pulse-light 2s infinite ease-in-out;
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }
        `}
      </style>
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10 border-2 border-purple-700">
        <h1 className="text-5xl font-extrabold text-pink-500 text-center mb-6 drop-shadow-lg font-serif">
          Fantasy RPG Generator
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <label htmlFor="characterName" className="text-xl font-semibold text-purple-300">
            Character Name:
          </label>
          <input
            type="text"
            id="characterName"
            className="p-3 bg-gray-700 border border-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg text-yellow-300 placeholder-gray-400 w-full sm:w-auto"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter name..."
            disabled={character !== null} // Disable input if character exists
          />
        </div>

        {!character ? (
          <>
            <p className="text-xl text-center text-purple-200 mb-6 flex items-center justify-center gap-2">
              <ScrollText size={24} className="text-pink-400" />
              {instruction}
            </p>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-6 text-center shadow-inner border border-gray-600 mb-8 overflow-hidden">
              <p ref={spinLabelRef} className="text-5xl font-bold text-yellow-400 tracking-wide font-mono transition-all duration-75 ease-linear">
                {currentSpinResult || '...'}
              </p>
            </div>

            <button
              onClick={handleSpinClick}
              disabled={spinning || character !== null || !characterName.trim()}
              className={`w-full py-4 rounded-xl text-2xl font-bold transition-all duration-300 shadow-lg
                ${spinning || character !== null || !characterName.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 to-red-700 hover:from-pink-700 hover:to-red-800 text-white transform hover:scale-105 active:scale-95'
                }`}
            >
              {spinning ? 'Spinning...' : 'Spin Character'}
            </button>
          </>
        ) : (
          <div className="mt-8">
            <h2 className="text-4xl font-bold text-pink-400 text-center mb-6 flex items-center justify-center gap-2">
              <Sparkles size={36} className="text-yellow-400" />
              Your Character!
            </h2>
            <CharacterSummary char={character} /> {/* levelUpThresholds is now imported in CharacterSummary directly */}

            {/* Game Actions */}
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

            <div className="mt-8 text-gray-400 text-sm text-center">
                <p>Progression & Combat Features planned:</p>
                <ul className="list-disc list-inside mx-auto w-fit text-left">
                  <li>XP Gain & Leveling (XP bar integrated)</li>
                  <li>Level Up Rewards (based on rank/level)</li>
                  <li>**Floating Stat Points** (for stat gains over 90, to be spent manually)</li>
                  <li>Equippable Artifacts/Armor for stat bonuses (with unique item handling)</li>
                  <li>Full Turn-Based Combat UI & Logic:</li>
                  <ul className="list-circle list-inside ml-4">
                    <li>HP system (scales by Durability)</li>
                    <li>**Turn Order: Higher Agility (Speed) attacks first**</li>
                    <li>Combat move selection (Attack, Defend, Use Ability)</li>
                    <li>Ability cooldowns/usage rules & First turn restriction</li>
                    <li>Influence of flaws on battle decisions</li>
                    <li>Damage calculation & Dodge mechanics</li>
                  </ul>
                </ul>
            </div>
          </div>
        )}

        <button
          onClick={showAllRankings}
          className="mt-8 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xl font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <BookOpen size={24} /> View All Rankings
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Your unique user ID: {userId || 'Authenticating...'}
        </p>

        {/* Modals - Render these conditionally if their state is true */}
        {showRankingsModal && (
          <RankingsModal allRankings={allRankings} onClose={closeRankingsModal} />
        )}

        {showQuestsModal && (
          <QuestsModal
            activeQuest={activeQuest}
            availableQuests={availableQuests}
            acceptQuest={acceptQuest}
            abandonQuest={abandonQuest}
            onClose={closeQuestsModal}
            generateQuests={generateQuests} // Pass generateQuests to refresh available quests
          />
        )}

        {showInventoryModal && (
          <InventoryModal
            character={character}
            onClose={closeInventoryModal}
          />
        )}

        {showCombatModal && combatants.player && combatants.opponent && (
          <CombatArena
            player={combatants.player}
            opponent={combatants.opponent}
            onClose={closeCombatModal}
            onCombatEnd={handleCombatEnd}
            activeQuest={activeQuest}
            updateQuestProgress={updateQuestProgress}
          />
        )}
      </div>
    </div>
  );
};

export default App;
