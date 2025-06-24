import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, getDocs } from 'firebase/firestore';
import { Sparkles, BookOpen } from 'lucide-react'; // Icons

// Import game data and helper functions
import {
  races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, weaponMasteryValues,
  specialAbilityYesNo, specialAbilities, specialAbilityNexusValues, fatalFlaws, statNames, steps,
  nexusRankThresholds, levelUpThresholds, itemTypes, questTemplates
} from './gameData.js'; // Explicit .js extension
import { randomInt, weightedRandom } from './utils/helpers.js'; // Explicit .js extension

// Import components
import CharacterSummary from './components/CharacterSummary.jsx'; // Explicit .jsx extension
import CharacterGenerator from './components/CharacterGenerator.jsx'; // Explicit .jsx extension
import GameActions from './components/GameActions.jsx'; // Explicit .jsx extension
import RankingsModal from './components/RankingsModal.jsx'; // Explicit .jsx extension
import QuestsModal from './components/QuestsModal.jsx'; // Explicit .jsx extension
import InventoryModal from './components/InventoryModal.jsx'; // Explicit .jsx extension
import CombatArena from './components/CombatArena.jsx'; // Explicit .jsx extension

// Firebase configuration - MANDATORY: DO NOT CHANGE THESE GLOBAL VARIABLES
// This logic checks if running in Canvas (__firebase_config is defined) or locally (uses hardcoded values)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
  // Running in Canvas environment
  firebaseConfig = JSON.parse(__firebase_config);
} else {
  // Running locally (e.g., via Vite dev server) with hardcoded Firebase details
  // IMPORTANT: For production, use environment variables or a more secure method like a .env file.
  // For local development, you would typically use: import.meta.env.VITE_FIREBASE_API_KEY etc.
  // Since this is for Canvas compilation primarily, we're hardcoding for simplicity here.
  firebaseConfig = {
    apiKey: "AIzaSyDtWmN_s0IuXaYd1gEDiYFvkx4s6VYPq20",
    authDomain: "fantasyrpg-03.firebaseapp.com",
    projectId: "fantasyrpg-03",
    storageBucket: "fantasyrpg-03.firebasestorage.app",
    messagingSenderId: "270407019620",
    appId: "1:270407019620:web:68ebdc1c0fa99fdb6bc371",
    measurementId: "G-GPEJ7SH66S"
  };
}

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  // State definitions
  const [userId, setUserId] = useState(null);
  const [character, setCharacter] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [currentSpinResult, setCurrentSpinResult] = useState('');
  const [instruction, setInstruction] = useState("Enter your character's name and click 'Spin Race'.");
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
  const spinLabelRef = useRef(null); // This ref will be passed to CharacterGenerator

  // Firebase Auth and Character Loading
  useEffect(() => {
    // Authenticate user
    const signInUser = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
        // Display custom modal for auth error
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-red-400 mb-4">Authentication Failed!</h3>
            <p class="text-lg text-gray-200">${error.message || "Could not connect to Firebase Authentication."}</p>
            <p class="text-md text-gray-400 mt-2">Please ensure Anonymous Authentication is enabled in your Firebase project settings.</p>
            <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Close</button>
          </div>
        `;
        document.body.appendChild(modal);
      }
    };

    signInUser();

    // Listen for auth state changes to get userId
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true); // Auth is ready, now can check Firestore
      } else {
        setUserId(null);
        setIsAuthReady(true); // Auth is ready, but no user signed in (e.g., anonymous sign-in failed)
      }
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, []);

  // Load character if exists when auth is ready
  useEffect(() => {
    const loadCharacter = async () => {
      if (userId && isAuthReady) {
        try {
          const charDocRef = doc(db, `artifacts/${appId}/users/${userId}/characters`, 'mainCharacter');
          const docSnap = await getDoc(charDocRef);
          if (docSnap.exists()) {
            const loadedChar = docSnap.data();
            setCharacter(loadedChar);
            setCharacterName(loadedChar.name || '');
            setInstruction(`Welcome back, ${loadedChar.name || 'Hero'}! Your UID: ${userId}`);
            // Also load active quest if saved
            if (loadedChar.activeQuest) {
              setActiveQuest(loadedChar.activeQuest);
            }
          } else {
            console.log("No existing character for this user.");
            setInstruction("Enter your character's name and click 'Spin Race'.");
          }
        } catch (e) {
          console.error("Error loading character:", e);
          // Replace with custom modal
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
              <h3 class="text-2xl font-bold text-red-400 mb-4">Error</h3>
              <p class="text-lg text-gray-200">Error loading character. Please try again.</p>
              <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Close</button>
            </div>
          `;
          document.body.appendChild(modal);
        }
      }
    };

    loadCharacter();
  }, [userId, isAuthReady]);

  const saveCharacter = useCallback(async (charData) => {
    if (!userId) {
      console.error("User not authenticated. Cannot save character.");
      // Replace with custom modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-red-400 mb-4">Authentication Error</h3>
            <p class="text-lg text-gray-200">Please wait for authentication to complete before saving.</p>
            <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Close</button>
          </div>
        `;
      document.body.appendChild(modal);
      return;
    }
    try {
      const charDocRef = doc(db, `artifacts/${appId}/users/${userId}/characters`, 'mainCharacter');
      await setDoc(charDocRef, charData);
      console.log("Character saved successfully!");
    } catch (e) {
      console.error("Error saving character:", e);
      // Replace with custom modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-red-400 mb-4">Save Error</h3>
            <p class="text-lg text-gray-200">Error saving character. Please try again.</p>
            <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Close</button>
          </div>
        `;
      document.body.appendChild(modal);
    }
  }, [userId]);

  const calculateNexusRating = useCallback((selectedCharacter) => {
    let rating = 0;
    // 1. Base race rarity score
    const raceData = races.find(r => r.name === selectedCharacter.Race);
    const raceScore = raceData ? raceData.rarity : 0;
    rating += raceScore;

    // 2. Stats contribute
    const stats = selectedCharacter.Stats || {};
    let totalStatPoints = 0;
    if (stats) {
      totalStatPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
      const statContribution = totalStatPoints / 8;
      rating += statContribution;
    }

    // 3. Weapon Presence and Mastery Bonus
    if (selectedCharacter["Weapon Yes/No"] === "Yes") {
      rating += 5;
      const mastery = weaponMasteryValues[selectedCharacter["Weapon Mastery"]]?.nexusBonus || 0;
      rating += mastery;
    }

    // 4. Special Ability Bonus
    const specialAbilityName = selectedCharacter.SpecialAbility;
    if (specialAbilityName && specialAbilityName !== "No" && specialAbilityName !== "None") {
      const ability = specialAbilities.find(sa => sa.name === specialAbilityName);
      if (ability) {
        const abilityBonus = specialAbilityNexusValues[ability.weight] || 0;
        rating += abilityBonus;
      }
    }

    // 5. Fatal Flaw reduces rating
    const fatalFlaw = fatalFlaws.find(f => f.name === selectedCharacter["Fatal Flaw"]);
    if (fatalFlaw && fatalFlaw.name !== "None") {
      rating -= 10;
    }

    rating = Math.max(0, Math.min(100, rating));
    selectedCharacter["Nexus Rating"] = parseFloat(rating.toFixed(2));

    let rank = "F";
    const sortedRanks = Object.entries(nexusRankThresholds).sort(([, thresholdA], [, thresholdB]) => thresholdA - thresholdB);

    for (const [r, threshold] of sortedRanks) {
      if (selectedCharacter["Nexus Rating"] >= threshold) {
        rank = r;
      } else {
        break;
      }
    }
    selectedCharacter["Nexus Rank"] = rank;
    return selectedCharacter;
  }, [races, specialAbilities, weaponMasteryValues, specialAbilityNexusValues, fatalFlaws, nexusRankThresholds]);

  // Combat System Helper: HP Calculation
  const calculateMaxHP = useCallback((durability) => {
    const baseHP = 100;
    const durabilityBonus = durability / 100;
    return Math.round(baseHP * (1 + durabilityBonus));
  }, []);

  // Reward System Functions
  const gainXP = useCallback((amount) => {
    if (!character) return;
    setCharacter(prevChar => {
      let newXP = prevChar.XP + amount;
      let newLevel = prevChar.Level;

      const nextLevelXP = levelUpThresholds[newLevel];
      if (nextLevelXP && newXP >= nextLevelXP) {
        newLevel++;
        newXP -= nextLevelXP;
        // Replace with custom modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-green-700 w-full max-w-sm text-center">
              <h3 class="text-2xl font-bold text-green-400 mb-4">Congratulations!</h3>
              <p class="text-lg text-gray-200">You reached Level ${newLevel}!</p>
              <button class="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Awesome!</button>
            </div>
          `;
        document.body.appendChild(modal);
      }

      const updatedChar = { ...prevChar, XP: newXP, Level: newLevel };
      saveCharacter(updatedChar);
      return updatedChar;
    });
  }, [character, saveCharacter, levelUpThresholds]);

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
        // Replace with custom modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-yellow-700 w-full max-w-sm text-center">
              <h3 class="text-2xl font-bold text-yellow-400 mb-4">Stat Cap Reached!</h3>
              <p class="text-lg text-gray-200">Your ${statName} reached 90! You gained ${floatingPointsGained} floating stat points.</p>
              <button class="mt-6 px-6 py-3 bg-yellow-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Got It!</button>
            </div>
          `;
        document.body.appendChild(modal);
      } else {
        // Replace with custom modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-green-700 w-full max-w-sm text-center">
              <h3 class="text-2xl font-bold text-green-400 mb-4">Stat Increased!</h3>
              <p class="text-lg text-gray-200">Your ${statName} increased to ${finalStatValue}!</p>
              <button class="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Okay</button>
            </div>
          `;
        document.body.appendChild(modal);
      }

      newStats[statName] = finalStatValue;

      const updatedChar = {
        ...prevChar,
        Stats: newStats,
        floatingStatPoints: (prevChar.floatingStatPoints || 0) + floatingPointsGained
      };
      const finalChar = calculateNexusRating(updatedChar);
      saveCharacter(finalChar);
      return finalChar;
    });
  }, [character, saveCharacter, calculateNexusRating]);

  const addItemToInventory = useCallback((itemToAdd) => {
    if (!character) return;
    setCharacter(prevChar => {
      const newInventory = [...(prevChar.inventory || [])];
      let itemAdded = false;

      if (itemToAdd.rarity === "Mythic") {
        const existingMythic = newInventory.some(item => item.name === itemToAdd.name && item.rarity === "Mythic");
        if (existingMythic) {
          // Replace with custom modal
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
              <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
                <h3 class="text-2xl font-bold text-red-400 mb-4">Inventory Full!</h3>
                <p class="text-lg text-gray-200">You already possess the Mythic item: ${itemToAdd.name}. Cannot acquire duplicates.</p>
                <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Okay</button>
              </div>
            `;
          document.body.appendChild(modal);
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
      // Replace with custom modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-green-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-green-400 mb-4">New Item!</h3>
            <p class="text-lg text-gray-200">You received: ${itemToAdd.name}${itemToAdd.quantity > 1 && itemToAdd.stackable ? ` (x${itemToAdd.quantity})` : ''}!</p>
            <button class="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Collect</button>
          </div>
        `;
      document.body.appendChild(modal);
      return updatedChar;
    });
  }, [character, saveCharacter]);

  // Function to generate random rewards from a weighted table
  const generateWeightedRewards = useCallback((level, numRewards = 1) => {
    const rewards = [];
    const rewardPool = [];

    const rarityWeights = {
      "Common": 50, "Uncommon": 30, "Rare": 15, "Epic": 4, "Legendary": 0.9, "Mythic": 0.1
    };

    rewardPool.push({ type: "stat_point_item", rarity: "Rare", name: "Minor Stat Crystal", value: randomInt(1, 2), weight: rarityWeights["Rare"] * 0.5 });

    Object.keys(itemTypes).forEach(category => {
      itemTypes[category].forEach(item => {
        if (item.type !== "stat_point_item") {
          const weight = rarityWeights[item.rarity] || 0;
          if (weight > 0) {
            rewardPool.push({ ...item, weight: weight });
          }
        }
      });
    });

    for (let i = 0; i < numRewards; i++) {
      const chosenItemName = weightedRandom(rewardPool);
      if (chosenItemName) {
        const chosenItem = rewardPool.find(item => item.name === chosenItemName);
        rewards.push(chosenItem);
      }
    }
    return rewards;
  }, []);

  // AI Opponent Generation
  const generateAIOpponent = useCallback((playerRank) => {
    const aiChar = {};
    const playerRatingThreshold = nexusRankThresholds[playerRank];
    const difficultyOffset = randomInt(-10, 5);
    const aiTargetRating = Math.max(0, Math.min(100, playerRatingThreshold + difficultyOffset));

    const eligibleAIRaces = races.filter(r => Math.abs(r.rarity - aiTargetRating) < 25);
    aiChar.Race = weightedRandom(eligibleAIRaces.length > 0 ? eligibleAIRaces : races);

    const aiAbilityOptions = abilities[aiChar.Race] || ["No Ability"];
    aiChar.Ability = aiAbilityOptions[randomInt(0, aiAbilityOptions.length - 1)];

    const aiStats = {};
    const baseStatTarget = randomInt(Math.max(20, (aiTargetRating / 100) * 45), Math.min(100, (aiTargetRating / 100) * 75));
    let aiStat90PlusCount = 0;
    for (const stat of statNames) {
      let statVal = randomInt(Math.max(20, baseStatTarget - 10), Math.min(100, baseStatTarget + 10));
      if (aiStat90PlusCount >= 1 && statVal >= 90) {
        statVal = randomInt(20, 89);
      }
      if (statVal >= 90) aiStat90PlusCount++;
      aiStats[stat] = statVal;
    }
    aiChar.Stats = aiStats;

    const hasWeapon = weightedRandom(weaponYesNo) === "Yes";
    aiChar["Weapon Yes/No"] = hasWeapon ? "Yes" : "No";
    if (hasWeapon) {
      const selectedWeaponType = weightedRandom(weaponTypes);
      aiChar["Weapon Type"] = selectedWeaponType;
      aiChar.weaponDetails = weaponTypes.find(w => w.name === selectedWeaponType);
      aiChar["Weapon Grade"] = weightedRandom(weaponGrades);
      aiChar["Weapon Mastery"] = weightedRandom(weaponMasteries);
    } else {
      aiChar["Weapon Type"] = "None";
      aiChar["Weapon Grade"] = "None";
      aiChar["Weapon Mastery"] = "None";
      aiChar.weaponDetails = null;
    }

    const hasSpecialAbility = weightedRandom(specialAbilityYesNo) === "Yes";
    aiChar["Special Ability Yes/No"] = hasSpecialAbility ? "Yes" : "No";
    if (hasSpecialAbility) {
      const selectedAbilityName = specialAbilities.find(sa => sa.name === weightedRandom(specialAbilities));
      aiChar["Special Ability"] = selectedAbilityName ? selectedAbilityName.name : "None";
      aiChar.abilityDetails = selectedAbilityName;
    } else {
      aiChar["Special Ability"] = "None";
      aiChar.abilityDetails = null;
    }

    const selectedFlaw = fatalFlaws[randomInt(0, fatalFlaws.length - 1)];
    aiChar["Fatal Flaw"] = selectedFlaw.name;
    aiChar.flawDetails = selectedFlaw;

    const finalAiChar = calculateNexusRating(aiChar);
    finalAiChar.name = `AI - ${finalAiChar.Race} ${randomInt(100,999)}`;
    finalAiChar.currentHP = calculateMaxHP(finalAiChar.Stats?.Durability || 0);
    finalAiChar.maxHP = finalAiChar.currentHP;
    finalAiChar.initialAbilityStates = finalAiChar.abilityDetails ? { [finalAiChar.abilityDetails.name]: { cooldown: 0, usesLeft: finalAiChar.abilityDetails.usesPerMatch === -1 ? 999 : finalAiChar.abilityDetails.usesPerMatch } } : {};
    finalAiChar.activeBuffs = [];
    return finalAiChar;
  }, [races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, specialAbilityYesNo, specialAbilities, fatalFlaws, calculateNexusRating, nexusRankThresholds, calculateMaxHP]);

  // Quests
  const generateQuests = useCallback(() => {
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
    const currentRankThreshold = nexusRankThresholds[charRank];

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

    const eligibleQuests = questTemplates.filter(q => {
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
  }, [character, nexusRankThresholds, questTemplates, activeQuest]);

  const acceptQuest = useCallback((quest) => {
    if (activeQuest) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-yellow-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-yellow-400 mb-4">Quest Conflict!</h3>
            <p class="text-lg text-gray-200">You already have an active quest. Complete or abandon it first!</p>
            <button class="mt-6 px-6 py-3 bg-yellow-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Okay</button>
          </div>
        `;
      document.body.appendChild(modal);
      return;
    }
    const newActiveQuest = { ...quest, currentProgress: quest.progress || {} };
    setActiveQuest(newActiveQuest);
    setCharacter(prevChar => {
      const updatedChar = { ...prevChar, activeQuest: newActiveQuest };
      saveCharacter(updatedChar);
      return updatedChar;
    });
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-green-700 w-full max-w-sm text-center">
          <h3 class="text-2xl font-bold text-green-400 mb-4">Quest Accepted!</h3>
          <p class="text-lg text-gray-200">Quest "${quest.name}" accepted!</p>
          <button class="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Great!</button>
        </div>
      `;
    document.body.appendChild(modal);
    setShowQuestsModal(false);
  }, [activeQuest, character, saveCharacter]);

  const abandonQuest = useCallback(() => {
    if (!activeQuest) return;

    const penaltyXP = Math.round((activeQuest.rewards.xp || 0) / 4);
    gainXP(-penaltyXP);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
          <h3 class="text-2xl font-bold text-red-400 mb-4">Quest Abandoned!</h3>
          <p class="text-lg text-gray-200">Quest "${activeQuest.name}" abandoned. You lost ${penaltyXP} XP as a penalty.</p>
          <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Okay</button>
        </div>
      `;
    document.body.appendChild(modal);

    setActiveQuest(null);
    setCharacter(prevChar => {
      const updatedChar = { ...prevChar, activeQuest: null };
      saveCharacter(updatedChar);
      return updatedChar;
    });
    setShowQuestsModal(false);
  }, [activeQuest, gainXP, setCharacter, saveCharacter]);


  // Character Generation Handler (passed to CharacterGenerator)
  const handleCharacterGeneration = useCallback(async ({ animateWheel, animateStats }) => {
    setSpinning(true);
    let selected = { name: characterName.trim(), XP: 0, Level: 1, inventory: [], floatingStatPoints: 0, activeQuest: null };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setInstruction(`Spinning ${step}...`);

      if (step === "Stats") {
        await new Promise(resolve => animateStats(selected, (updatedChar) => {
          selected = updatedChar;
          resolve();
        }));
        setCurrentSpinResult(spinLabelRef.current.textContent); // Update state from ref's current content
        continue;
      }

      if ((step === "Weapon Type" || step === "Weapon Grade" || step === "Weapon Mastery") && selected["Weapon Yes/No"] === "No") {
        selected[step] = "None";
        setInstruction(`${step} skipped.`);
        setCurrentSpinResult("Skipped"); // Update state
        if (spinLabelRef.current) { spinLabelRef.current.textContent = "Skipped"; } // Direct DOM update
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      if (step === "Special Ability" && selected["Special Ability Yes/No"] === "No") {
        selected[step] = "None";
        setInstruction(`${step} skipped.`);
        setCurrentSpinResult("Skipped"); // Update state
        if (spinLabelRef.current) { spinLabelRef.current.textContent = "Skipped"; } // Direct DOM update
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

      const result = await new Promise(resolve => animateWheel(options, resolve));
      selected[step] = result;
      setCurrentSpinResult(spinLabelRef.current.textContent); // Update state from ref's current content
      setInstruction(`${step} selected: ${result}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const finalCharacter = calculateNexusRating(selected);
    setCharacter(finalCharacter);
    saveCharacter(finalCharacter);
    setInstruction("Character generation complete! Review your character below.");
    setSpinning(false);
  }, [characterName, userId, saveCharacter, calculateNexusRating, races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, specialAbilityYesNo, specialAbilities, fatalFlaws, spinLabelRef, setCurrentSpinResult, setSpinning]);


  const showAllRankings = useCallback(async () => {
    if (!isAuthReady) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-yellow-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-yellow-400 mb-4">Authentication Not Ready</h3>
            <p class="text-lg text-gray-200">Authentication not ready. Please wait.</p>
            <button class="mt-6 px-6 py-3 bg-yellow-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Okay</button>
          </div>
        `;
      document.body.appendChild(modal);
      return;
    }
    try {
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
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-red-400 mb-4">Error Fetching Rankings</h3>
            <p class="text-lg text-gray-200">Error fetching rankings.</p>
            <button class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Close</button>
          </div>
        `;
      document.body.appendChild(modal);
    }
  }, [userId, isAuthReady, appId, db]); // Added appId, db to dependencies

  const closeRankingsModal = () => { setShowRankingsModal(false); };
  const closeQuestsModal = () => { setShowQuestsModal(false); };
  const closeInventoryModal = () => { setShowInventoryModal(false); };
  const closeCombatModal = () => {
    setShowCombatModal(false);
    setCombatants({ player: null, opponent: null });
  };

  // Callback to update quest progress from CombatArena or other activities
  const updateQuestProgress = useCallback((questId, progressType, value) => {
    setCharacter(prevChar => {
      if (!prevChar || !prevChar.activeQuest || prevChar.activeQuest.id !== questId) {
        return prevChar;
      }

      const updatedProgress = { ...prevChar.activeQuest.currentProgress };
      if (progressType === "wins") {
        updatedProgress.currentWins = (updatedProgress.currentWins || 0) + value;
        if (prevChar.activeQuest.type === "Battle Quest" && updatedProgress.currentWins >= prevChar.activeQuest.specifics.winsRequired) {
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
              <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-green-700 w-full max-w-sm text-center">
                <h3 class="text-2xl font-bold text-green-400 mb-4">Quest Complete!</h3>
                <p class="text-lg text-gray-200">Quest "${prevChar.activeQuest.name}" completed!</p>
                <button class="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Hooray!</button>
              </div>
            `;
          document.body.appendChild(modal);
          const rewards = prevChar.activeQuest.rewards;
          if (rewards.xp) gainXP(rewards.xp);
          if (rewards.item) addItemToInventory(rewards.item);

          return { ...prevChar, activeQuest: null };
        }
      }

      const updatedActiveQuest = { ...prevChar.activeQuest, currentProgress: updatedProgress };
      saveCharacter({ ...prevChar, activeQuest: updatedActiveQuest });
      return { ...prevChar, activeQuest: updatedActiveQuest };
    });
  }, [character, gainXP, addItemToInventory, saveCharacter]);


  // Mock Combat Start - will generate AI opponent and start combat modal
  const startMockCombat = useCallback(() => {
    if (!character) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-yellow-700 w-full max-w-sm text-center">
            <h3 class="text-2xl font-bold text-yellow-400 mb-4">No Character!</h3>
            <p class="text-lg text-gray-200">Please generate a character first!</p>
            <button class="mt-6 px-6 py-3 bg-yellow-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Okay</button>
          </div>
        `;
      document.body.appendChild(modal);
      return;
    }
    const opponent = generateAIOpponent(character["Nexus Rank"]);
    const playerWithHP = { ...character, currentHP: calculateMaxHP(character.Stats?.Durability || 0), maxHP: calculateMaxHP(character.Stats?.Durability || 0) };

    setCombatants({ player: playerWithHP, opponent: opponent });
    setShowCombatModal(true);
  }, [character, generateAIOpponent, calculateMaxHP]);

  // Handle combat end (win/loss)
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
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 ${winner === 'player' ? 'border-green-700' : 'border-red-700'} w-full max-w-sm text-center">
          <h3 class="text-2xl font-bold ${winner === 'player' ? 'text-green-400' : 'text-red-400'} mb-4">${winner === 'player' ? 'Victory!' : 'Defeat!'}</h3>
          <p class="text-lg text-gray-200">${message}</p>
          <button class="mt-6 px-6 py-3 ${winner === 'player' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white text-lg font-bold rounded-lg shadow-md transition-colors duration-200" onclick="this.parentNode.parentNode.remove()">Continue</button>
        </div>
      `;
    document.body.appendChild(modal);
    closeCombatModal();
  }, [gainXP, addItemToInventory, closeCombatModal, character, activeQuest, updateQuestProgress, generateWeightedRewards]);

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
            disabled={character !== null}
          />
        </div>

        {!character ? (
          <CharacterGenerator
            characterName={characterName}
            setCharacterName={setCharacterName}
            spinning={spinning}
            setSpinning={setSpinning}
            currentSpinResult={currentSpinResult}
            setCurrentSpinResult={setCurrentSpinResult}
            instruction={instruction}
            setInstruction={setInstruction}
            spinLabelRef={spinLabelRef} // Pass the ref here
            onStartGeneration={handleCharacterGeneration}
          />
        ) : (
          <div className="mt-8">
            <h2 className="text-4xl font-bold text-pink-400 text-center mb-6 flex items-center justify-center gap-2">
              <Sparkles size={36} className="text-yellow-400" />
              Your Character!
            </h2>
            <CharacterSummary character={character} />

            <GameActions
              generateQuests={generateQuests}
              startMockCombat={startMockCombat}
              setShowInventoryModal={setShowInventoryModal}
            />

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

        <RankingsModal
          showRankingsModal={showRankingsModal}
          allRankings={allRankings}
          onClose={closeRankingsModal}
        />

        <QuestsModal
          showQuestsModal={showQuestsModal}
          activeQuest={activeQuest}
          availableQuests={availableQuests}
          onClose={closeQuestsModal}
          acceptQuest={acceptQuest}
          abandonQuest={abandonQuest}
        />

        <InventoryModal
          showInventoryModal={showInventoryModal}
          character={character}
          onClose={closeInventoryModal}
        />

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