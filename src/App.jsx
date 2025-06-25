import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, getDocs } from 'firebase/firestore';
import { Sparkles, BookOpen, Crown, Sword, Shield, Zap } from 'lucide-react';

// Import game data and helper functions
import {
  races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, weaponMasteryValues,
  specialAbilityYesNo, specialAbilities, specialAbilityNexusValues, fatalFlaws, statNames, steps,
  nexusRankThresholds, levelUpThresholds, itemTypes, questTemplates
} from './gameData.js';
import { randomInt, weightedRandom } from './utils/helpers.js';

// Import components
import CharacterSummary from './components/CharacterSummary.jsx';
import CharacterGenerator from './components/CharacterGenerator.jsx';
import GameActions from './components/GameActions.jsx';
import RankingsModal from './components/RankingsModal.jsx';
import QuestsModal from './components/QuestsModal.jsx';
import InventoryModal from './components/InventoryModal.jsx';
import CombatArena from './components/CombatArena.jsx';

// Firebase configuration
let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
  firebaseConfig = JSON.parse(__firebase_config);
} else {
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

// Use the projectId from firebaseConfig instead of a potentially undefined variable
const appId = firebaseConfig.projectId;

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
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
  const [instruction, setInstruction] = useState("Enter your character's name and begin your legendary journey...");
  const [showRankingsModal, setShowRankingsModal] = useState(false);
  const [allRankings, setAllRankings] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [availableQuests, setAvailableQuests] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [combatants, setCombatants] = useState({ player: null, opponent: null });
  
  const spinLabelRef = useRef(null);

  // Firebase Auth and Character Loading
  useEffect(() => {
    const signInUser = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
        showCustomModal("Authentication Failed!", error.message || "Could not connect to Firebase Authentication.", "error");
      }
    };

    signInUser();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        setUserId(null);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load character when auth is ready
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
            setInstruction(`Welcome back, ${loadedChar.name || 'Hero'}! Your legend continues...`);
            if (loadedChar.activeQuest) {
              setActiveQuest(loadedChar.activeQuest);
            }
          } else {
            setInstruction("Enter your character's name and begin your legendary journey...");
          }
        } catch (e) {
          console.error("Error loading character:", e);
          showCustomModal("Error", "Error loading character. Please try again.", "error");
        }
      }
    };

    loadCharacter();
  }, [userId, isAuthReady]);

  // Custom modal function
  const showCustomModal = (title, message, type = "info") => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm';
    const borderColor = type === "error" ? "border-red-500" : type === "success" ? "border-emerald-500" : "border-amber-500";
    const titleColor = type === "error" ? "text-red-400" : type === "success" ? "text-emerald-400" : "text-amber-400";
    const bgGradient = type === "error" ? "from-red-900/20 to-red-800/20" : type === "success" ? "from-emerald-900/20 to-emerald-800/20" : "from-amber-900/20 to-amber-800/20";
    
    modal.innerHTML = `
      <div class="bg-gradient-to-br ${bgGradient} backdrop-blur-md rounded-2xl shadow-2xl p-8 border-2 ${borderColor} w-full max-w-md text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <div class="relative z-10">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span class="text-2xl">✨</span>
          </div>
          <h3 class="text-3xl font-bold ${titleColor} mb-6 font-fantasy">${title}</h3>
          <p class="text-lg text-gray-200 mb-8 leading-relaxed">${message}</p>
          <button class="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-serif border border-amber-400/50" onclick="this.parentNode.parentNode.parentNode.remove()">
            Understood
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const saveCharacter = useCallback(async (charData) => {
    if (!userId) {
      showCustomModal("Authentication Error", "Please wait for authentication to complete before saving.", "error");
      return;
    }
    try {
      const charDocRef = doc(db, `artifacts/${appId}/users/${userId}/characters`, 'mainCharacter');
      await setDoc(charDocRef, charData);
      console.log("Character saved successfully!");
    } catch (e) {
      console.error("Error saving character:", e);
      showCustomModal("Save Error", "Error saving character. Please try again.", "error");
    }
  }, [userId]);

  const calculateNexusRating = useCallback((selectedCharacter) => {
    let rating = 0;
    
    const raceData = races.find(r => r.name === selectedCharacter.Race);
    const raceScore = raceData ? raceData.rarity : 0;
    rating += raceScore;

    const stats = selectedCharacter.Stats || {};
    let totalStatPoints = 0;
    if (stats) {
      totalStatPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
      const statContribution = totalStatPoints / 8;
      rating += statContribution;
    }

    if (selectedCharacter["Weapon Yes/No"] === "Yes") {
      rating += 5;
      const mastery = weaponMasteryValues[selectedCharacter["Weapon Mastery"]]?.nexusBonus || 0;
      rating += mastery;
    }

    const specialAbilityName = selectedCharacter["Special Ability"];
    if (specialAbilityName && specialAbilityName !== "No" && specialAbilityName !== "None") {
      const ability = specialAbilities.find(sa => sa.name === specialAbilityName);
      if (ability) {
        const abilityBonus = specialAbilityNexusValues[ability.weight] || 0;
        rating += abilityBonus;
      }
    }

    const fatalFlaw = fatalFlaws.find(f => f.name === selectedCharacter["Fatal Flaw"]);
    if (fatalFlaw && fatalFlaw.name !== "None") {
      rating -= 10;
    }

    rating = Math.max(0, Math.min(100, rating));
    selectedCharacter["Nexus Rating"] = parseFloat(rating.toFixed(2));

    let rank = "F";
    const sortedRanks = Object.entries(nexusRankThresholds).sort(([, a], [, b]) => a - b);

    for (const [r, threshold] of sortedRanks) {
      if (selectedCharacter["Nexus Rating"] >= threshold) {
        rank = r;
      } else {
        break;
      }
    }
    selectedCharacter["Nexus Rank"] = rank;
    return selectedCharacter;
  }, []);

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
        showCustomModal("Level Up!", `Congratulations! You reached Level ${newLevel}!`, "success");
      }

      const updatedChar = { ...prevChar, XP: newXP, Level: newLevel };
      saveCharacter(updatedChar);
      return updatedChar;
    });
  }, [character, saveCharacter]);

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
        showCustomModal("Stat Cap Reached!", `Your ${statName} reached 90! You gained ${floatingPointsGained} floating stat points.`, "success");
      } else {
        showCustomModal("Stat Increased!", `Your ${statName} increased to ${finalStatValue}!`, "success");
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
          showCustomModal("Inventory Full!", `You already possess the Mythic item: ${itemToAdd.name}. Cannot acquire duplicates.`, "error");
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
      showCustomModal("New Item!", `You received: ${itemToAdd.name}${itemToAdd.quantity > 1 && itemToAdd.stackable ? ` (x${itemToAdd.quantity})` : ''}!`, "success");
      return updatedChar;
    });
  }, [character, saveCharacter]);

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
      const selectedAbilityName = weightedRandom(specialAbilities);
      aiChar["Special Ability"] = selectedAbilityName;
      aiChar.abilityDetails = specialAbilities.find(sa => sa.name === selectedAbilityName);
    } else {
      aiChar["Special Ability"] = "None";
      aiChar.abilityDetails = null;
    }

    const selectedFlaw = fatalFlaws[randomInt(0, fatalFlaws.length - 1)];
    aiChar["Fatal Flaw"] = selectedFlaw.name;
    aiChar.flawDetails = selectedFlaw;

    const finalAiChar = calculateNexusRating(aiChar);
    finalAiChar.name = `${finalAiChar.Race} Warrior ${randomInt(100,999)}`;
    finalAiChar.currentHP = calculateMaxHP(finalAiChar.Stats?.Durability || 0);
    finalAiChar.maxHP = finalAiChar.currentHP;
    finalAiChar.initialAbilityStates = finalAiChar.abilityDetails ? { [finalAiChar.abilityDetails.name]: { cooldown: 0, usesLeft: finalAiChar.abilityDetails.usesPerMatch === -1 ? 999 : finalAiChar.abilityDetails.usesPerMatch } } : {};
    finalAiChar.activeBuffs = [];
    return finalAiChar;
  }, [races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, specialAbilityYesNo, specialAbilities, fatalFlaws, calculateNexusRating, nexusRankThresholds, calculateMaxHP]);

  // Quest system
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
        name: `Ascension Trial: Rise to ${nextRank}`,
        description: `Complete a legendary challenge to ascend to Nexus Rank ${nextRank}!`,
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
      showCustomModal("Quest Conflict!", "You already have an active quest. Complete or abandon it first!", "error");
      return;
    }
    const newActiveQuest = { ...quest, currentProgress: quest.progress || {} };
    setActiveQuest(newActiveQuest);
    setCharacter(prevChar => {
      const updatedChar = { ...prevChar, activeQuest: newActiveQuest };
      saveCharacter(updatedChar);
      return updatedChar;
    });
    showCustomModal("Quest Accepted!", `Quest "${quest.name}" accepted!`, "success");
    setShowQuestsModal(false);
  }, [activeQuest, character, saveCharacter]);

  const abandonQuest = useCallback(() => {
    if (!activeQuest) return;

    const penaltyXP = Math.round((activeQuest.rewards.xp || 0) / 4);
    gainXP(-penaltyXP);

    showCustomModal("Quest Abandoned!", `Quest "${activeQuest.name}" abandoned. You lost ${penaltyXP} XP as a penalty.`, "error");

    setActiveQuest(null);
    setCharacter(prevChar => {
      const updatedChar = { ...prevChar, activeQuest: null };
      saveCharacter(updatedChar);
      return updatedChar;
    });
    setShowQuestsModal(false);
  }, [activeQuest, gainXP, character, saveCharacter]);

  // Character Generation Handler
  const handleCharacterGeneration = useCallback(async ({ animateWheel, animateStats }) => {
    setSpinning(true);
    let selected = { name: characterName.trim(), XP: 0, Level: 1, inventory: [], floatingStatPoints: 0, activeQuest: null };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setInstruction(`Weaving the threads of fate... ${step}...`);

      if (step === "Stats") {
        await new Promise(resolve => animateStats(selected, (updatedChar) => {
          selected = updatedChar;
          resolve();
        }));
        setCurrentSpinResult(spinLabelRef.current.textContent);
        continue;
      }

      if ((step === "Weapon Type" || step === "Weapon Grade" || step === "Weapon Mastery") && selected["Weapon Yes/No"] === "No") {
        selected[step] = "None";
        setInstruction(`${step} skipped by the fates...`);
        setCurrentSpinResult("Skipped");
        if (spinLabelRef.current) { spinLabelRef.current.textContent = "Skipped"; }
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      if (step === "Special Ability" && selected["Special Ability Yes/No"] === "No") {
        selected[step] = "None";
        setInstruction(`${step} withheld by destiny...`);
        setCurrentSpinResult("Skipped");
        if (spinLabelRef.current) { spinLabelRef.current.textContent = "Skipped"; }
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
      setCurrentSpinResult(spinLabelRef.current.textContent);
      setInstruction(`${step} chosen: ${result}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const finalCharacter = calculateNexusRating(selected);
    setCharacter(finalCharacter);
    saveCharacter(finalCharacter);
    setInstruction("Your legend begins! The realm awaits your deeds...");
    setSpinning(false);
  }, [characterName, userId, saveCharacter, calculateNexusRating, races, abilities, weaponYesNo, weaponTypes, weaponGrades, weaponMasteries, specialAbilityYesNo, specialAbilities, fatalFlaws, spinLabelRef, setCurrentSpinResult, setSpinning]);

  const showAllRankings = useCallback(async () => {
    if (!isAuthReady) {
      showCustomModal("Authentication Not Ready", "Authentication not ready. Please wait.", "error");
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
      showCustomModal("Error Fetching Rankings", "Error fetching rankings.", "error");
    }
  }, [userId, isAuthReady, appId, db]);

  const closeRankingsModal = () => { setShowRankingsModal(false); };
  const closeQuestsModal = () => { setShowQuestsModal(false); };
  const closeInventoryModal = () => { setShowInventoryModal(false); };
  const closeCombatModal = () => {
    setShowCombatModal(false);
    setCombatants({ player: null, opponent: null });
  };

  const updateQuestProgress = useCallback((questId, progressType, value) => {
    setCharacter(prevChar => {
      if (!prevChar || !prevChar.activeQuest || prevChar.activeQuest.id !== questId) {
        return prevChar;
      }

      const updatedProgress = { ...prevChar.activeQuest.currentProgress };
      if (progressType === "wins") {
        updatedProgress.currentWins = (updatedProgress.currentWins || 0) + value;
        if (prevChar.activeQuest.type === "Battle Quest" && updatedProgress.currentWins >= prevChar.activeQuest.specifics.winsRequired) {
          showCustomModal("Quest Complete!", `Quest "${prevChar.activeQuest.name}" completed!`, "success");
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

  const startMockCombat = useCallback(() => {
    if (!character) {
      showCustomModal("No Character!", "Please generate a character first!", "error");
      return;
    }
    const opponent = generateAIOpponent(character["Nexus Rank"]);
    const playerWithHP = { ...character, currentHP: calculateMaxHP(character.Stats?.Durability || 0), maxHP: calculateMaxHP(character.Stats?.Durability || 0) };

    setCombatants({ player: playerWithHP, opponent: opponent });
    setShowCombatModal(true);
  }, [character, generateAIOpponent, calculateMaxHP]);

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
    
    showCustomModal(winner === 'player' ? 'Victory!' : 'Defeat!', message, winner === 'player' ? 'success' : 'error');
    closeCombatModal();
  }, [gainXP, addItemToInventory, closeCombatModal, character, activeQuest, updateQuestProgress, generateWeightedRewards]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-amber-400 rounded-full animate-float opacity-70"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-float opacity-80" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-blue-400 rounded-full animate-float opacity-50" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-60" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-40" style={{animationDelay: '1.5s'}}></div>
        
        {/* Mystical orbs */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-7xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-12 border border-amber-500/30 backdrop-blur-xl relative overflow-hidden">
          
          {/* Decorative border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 blur-sm"></div>
          <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <Crown size={32} className="text-white" />
                </div>
                <h1 className="text-6xl lg:text-7xl font-extrabold text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text drop-shadow-2xl font-fantasy animate-glow">
                  Realm of Legends
                </h1>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles size={32} className="text-white animate-spin-slow" />
                </div>
              </div>
              <p className="text-2xl text-amber-200 font-serif italic mb-4">
                Where heroes are forged and legends are born
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>

            {/* Character Name Input */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-12">
              <label htmlFor="characterName" className="text-2xl font-bold text-amber-400 font-serif flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <Crown size={20} className="text-white" />
                </div>
                Hero's Name:
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="characterName"
                  className="p-4 bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-amber-500/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:border-amber-400 text-xl text-white placeholder-slate-400 w-full lg:w-80 font-serif transition-all duration-300 shadow-lg"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your legend..."
                  disabled={character !== null}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/10 to-purple-400/10 pointer-events-none"></div>
              </div>
            </div>

            {!character ? (
              <CharacterGenerator
                characterName={characterName}
                spinning={spinning}
                setSpinning={setSpinning}
                currentSpinResult={currentSpinResult}
                setCurrentSpinResult={setCurrentSpinResult}
                instruction={instruction}
                spinLabelRef={spinLabelRef}
                onStartGeneration={handleCharacterGeneration}
              />
            ) : (
              <div className="mt-8">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Sparkles size={48} className="text-amber-400 animate-pulse" />
                    <h2 className="text-5xl lg:text-6xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-fantasy">
                      Your Legend Awakens!
                    </h2>
                    <Sparkles size={48} className="text-purple-400 animate-pulse" style={{animationDelay: '1s'}} />
                  </div>
                  <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
                </div>
                
                <CharacterSummary character={character} />
                <GameActions
                  generateQuests={generateQuests}
                  startMockCombat={startMockCombat}
                  setShowInventoryModal={setShowInventoryModal}
                />

                {/* Enhanced Features Info */}
                <div className="mt-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
                  <div className="text-center mb-8">
                    <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-fantasy mb-4">
                      🌟 Legendary Features 🌟
                    </h3>
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl p-6 border border-red-500/30">
                      <h4 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3 font-fantasy">
                        <Sword size={24} />
                        Combat System
                      </h4>
                      <ul className="space-y-2 text-slate-300">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          Turn-based tactical combat
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          Speed determines turn order
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Special abilities with cooldowns
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Dodge mechanics & damage calculation
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Fatal flaw effects in battle
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-xl p-6 border border-emerald-500/30">
                      <h4 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-3 font-fantasy">
                        <Shield size={24} />
                        Progression System
                      </h4>
                      <ul className="space-y-2 text-slate-300">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          XP gain & leveling system
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Floating stat points (90+ cap)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          Quest system with rewards
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          Rank progression trials
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          Loot & inventory management
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rankings Button */}
            <div className="mt-12 text-center">
              <button
                onClick={showAllRankings}
                className="group px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 font-serif border border-purple-400/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-4">
                  <BookOpen size={32} className="animate-pulse" />
                  Hall of Legends
                  <BookOpen size={32} className="animate-pulse" style={{animationDelay: '1s'}} />
                </div>
              </button>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-slate-400 font-serif">
                Your unique realm ID: <span className="text-amber-400 font-mono">{userId || 'Connecting to the mystical realm...'}</span>
              </p>
            </div>
          </div>

          {/* Modals */}
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
    </div>
  );
};

export default App;