// src/components/CombatArena.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import only necessary utilities here
import { randomInt } from '../utils/gameUtils';
// Import all necessary game data constants directly here
import { specialAbilities, weaponTypes, weaponMasteryValues, fatalFlaws, statNames } from '../data/gameData';
import { ChevronRight, Sword, Shield, Zap } from 'lucide-react';

const CombatArena = ({ player, opponent, onClose, onCombatEnd, activeQuest, updateQuestProgress }) => {
  // Combat state
  const [currentPlayerHP, setCurrentPlayerHP] = useState(player.currentHP);
  const [currentOpponentHP, setCurrentOpponentHP] = useState(opponent.currentHP);
  const [combatTurn, setCombatTurn] = useState(1);
  const [currentAttackerId, setCurrentAttackerId] = useState(null); // 'player' or 'opponent'
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const logRef = useRef(null);
  const [playerAbilityStates, setPlayerAbilityStates] = useState(player.initialAbilityStates || {});
  const [opponentAbilityStates, setOpponentAbilityStates] = useState(opponent.initialAbilityStates || {});
  const [playerBuffsDebuffs, setPlayerBuffsDebuffs] = useState(player.activeBuffs || []);
  const [opponentBuffsDebuffs, setOpponentBuffsDebuffs] = useState(opponent.activeBuffs || []);
  const [showAbilitySelection, setShowAbilitySelection] = useState(false);


  // Function to add messages to combat log (Defined early)
  const addLog = useCallback((message) => {
    setLogMessages(prev => [...prev, message]);
  }, []); // Empty dependency array for addLog as it only uses setLogMessages, which is stable

  // Helper to get current effective stats considering buffs/debuffs
  const getEffectiveStats = useCallback((baseStats, buffsDebuffs) => {
    const effectiveStats = { ...baseStats };
    buffsDebuffs.forEach(effect => {
      if (effect.type === "statPenalty" && effect.stat) { // Ensure stat property exists
        effectiveStats[effect.stat] = Math.max(0, effectiveStats[effect.stat] + effect.value); // Penalties are negative values
      } else if (effect.type === "statBoost" && effect.stat) {
        effectiveStats[effect.stat] = effectiveStats[effect.stat] + effect.value;
      }
      // Add more buff/debuff types here
    });
    return effectiveStats;
  }, []); // statNames is a constant, no need in deps array as per linting rules (it doesn't change)

  // Function to calculate damage (Physical)
  const calculatePhysicalDamage = useCallback((attacker, defender, attackTypeElement = null) => {
    const attackerEffectiveStats = getEffectiveStats(attacker.Stats, attacker.activeBuffs);
    const defenderEffectiveStats = getEffectiveStats(defender.Stats, defender.activeBuffs);

    const attackerStrength = attackerEffectiveStats?.Strength || 0;
    const attackerWeapon = attacker["Weapon Yes/No"] === "Yes" ? weaponTypes.find(w => w.name === attacker["Weapon Type"]) : null;
    const attackerMastery = attacker["Weapon Yes/No"] === "Yes" ? weaponMasteryValues[attacker["Weapon Mastery"]] : null;

    let baseDamage = attackerStrength / 5; // Strength contribution (toned down)
    if (attackerWeapon) {
      baseDamage += attackerWeapon.baseDamage;
    }
    if (attackerMastery) {
      baseDamage += attackerMastery.damageBonus;
    }

    // Defender's Durability for percentage reduction
    const defenderDurability = defenderEffectiveStats?.Durability || 0;
    const damageReductionFactor = defenderDurability / 200; // e.g., 100 durability = 50% reduction
    let finalDamage = baseDamage * (1 - damageReductionFactor);

    // Apply defending buff if active
    const isDefending = defender.activeBuffs.some(buff => buff.type === 'defending');
    if (isDefending) {
        const defenseBonus = (defenderEffectiveStats.Durability || 0) + (defenderEffectiveStats.Speed || 0) + (defenderEffectiveStats.CombatSkill || 0);
        const defendReduction = defenseBonus / 400; // Combined defensive stats reduce damage further
        finalDamage *= (1 - defendReduction);
        addLog(`${defender.name} defends, reducing incoming damage!`);
    }

    // Apply fatal flaw effects (defender's flaw affecting damage received by defender from specific types)
    const defenderFlawDetails = fatalFlaws.find(f => f.name === defender["Fatal Flaw"]);
    if (defenderFlawDetails?.combatEffect?.opponentDamageBoost && defenderFlawDetails.combatEffect.appliesToType === attackTypeElement) {
      finalDamage *= (1 + defenderFlawDetails.combatEffect.opponentDamageBoost);
      addLog(`${defender.name}'s ${defenderFlawDetails.name} flaw increased incoming ${attackTypeElement} damage!`);
    }

    return Math.max(1, Math.round(finalDamage)); // Minimum 1 damage
  }, [weaponTypes, weaponMasteryValues, fatalFlaws, addLog, getEffectiveStats]);

  // Function to calculate damage (Magical)
  const calculateMagicalDamage = useCallback((attacker, defender, ability, attackTypeElement = null) => {
    const attackerEffectiveStats = getEffectiveStats(attacker.Stats, attacker.activeBuffs);
    const defenderEffectiveStats = getEffectiveStats(defender.Stats, defender.activeBuffs);

    const attackerIntelligence = attackerEffectiveStats?.Intelligence || 0;
    let baseDamage = attackerIntelligence / 5; // Intelligence contribution (toned down)
    if (ability) {
      baseDamage += ability.power;
    }

    // Defender's Durability for percentage reduction
    const defenderDurability = defenderEffectiveStats?.Durability || 0;
    const damageReductionFactor = defenderDurability / 200;
    let finalDamage = baseDamage * (1 - damageReductionFactor);

    // Apply defending buff if active
    const isDefending = defender.activeBuffs.some(buff => buff.type === 'defending');
    if (isDefending) {
        const defenseBonus = (defenderEffectiveStats.Durability || 0) + (defenderEffectiveStats.Speed || 0) + (defenderEffectiveStats.CombatSkill || 0);
        const defendReduction = defenseBonus / 400;
        finalDamage *= (1 - defendReduction);
        addLog(`${defender.name} defends, reducing incoming damage!`);
    }

    // Apply fatal flaw effects (defender's flaw affecting damage received by defender from specific types)
    const defenderFlawDetails = fatalFlaws.find(f => f.name === defender["Fatal Flaw"]);
    if (defenderFlawDetails?.combatEffect?.opponentDamageBoost && defenderFlawDetails.combatEffect.appliesToType === attackTypeElement) {
      finalDamage *= (1 + defenderFlawDetails.combatEffect.opponentDamageBoost);
      addLog(`${defender.name}'s ${defenderFlawDetails.name} flaw increased incoming ${attackTypeElement} damage!`);
    }

    return Math.max(1, Math.round(finalDamage)); // Minimum 1 damage
  }, [fatalFlaws, addLog, getEffectiveStats]);

  // Combat System Helper: Dodge Chance Calculation (Agility = Speed)
  const getDodgeChance = useCallback((attackerStats, defenderStats, attackerWeaponData) => {
    const baseDodge = 5; // 5%

    // Agility Scaled Bonus (using Speed for agility)
    const defenderSpeed = defenderStats?.Speed || 0;
    const attackerSpeed = attackerStats?.Speed || 0;
    const agilityDifference = defenderSpeed - attackerSpeed;
    let agilityBonus = Math.max(0, agilityDifference / 10); // e.g., 30 diff = 3%

    // Attacker's Weapon Mastery Dodge Reduction
    let masteryPenalty = 0;
    if (attackerWeaponData?.name && attackerWeaponData?.mastery) { // Check if weapon exists and mastery is set
      masteryPenalty = weaponMasteryValues[attackerWeaponData.mastery]?.dodgePenalty || 0;
    }

    let finalDodgeChance = baseDodge + agilityBonus - masteryPenalty;
    return Math.max(0, Math.min(100, finalDodgeChance)); // Clamp between 0 and 100
  }, [weaponMasteryValues]);


  // Initial combat setup (moved useCallbacks outside this useEffect)
  useEffect(() => {
    const playerSpeed = player.Stats?.Speed || 0;
    const opponentSpeed = opponent.Stats?.Speed || 0;

    let firstAttackerId = 'player';
    if (opponentSpeed > playerSpeed) {
      firstAttackerId = 'opponent';
    } else if (opponentSpeed === playerSpeed) {
      firstAttackerId = randomInt(0, 1) === 0 ? 'player' : 'opponent'; // Tie-breaker
    }

    setCurrentAttackerId(firstAttackerId);
    setIsPlayerTurn(firstAttackerId === 'player');
    addLog(`${firstAttackerId === 'player' ? player.name : opponent.name} attacks first!`);

    // Apply permanent combat effects from flaws (e.g., Curse of Weakness)
    const playerFlawDetails = fatalFlaws.find(f => f.name === player["Fatal Flaw"]);
    if (playerFlawDetails?.combatEffect?.statPenalty && playerFlawDetails.combatEffect.duration === -1) { // -1 duration means permanent for battle
        setPlayerBuffsDebuffs(prev => [...prev, { type: "statPenalty", ...playerFlawDetails.combatEffect.statPenalty, id: "flaw_perm_player" }]);
        addLog(`${player.name}'s ${playerFlawDetails.name} flaw applies a stat penalty!`);
    }
    const opponentFlawDetails = fatalFlaws.find(f => f.name === opponent["Fatal Flaw"]);
    if (opponentFlawDetails?.combatEffect?.statPenalty && opponentFlawDetails.combatEffect.duration === -1) {
        setOpponentBuffsDebuffs(prev => [...prev, { type: "statPenalty", ...opponentFlawDetails.combatEffect.statPenalty, id: "flaw_perm_opponent" }]);
        addLog(`${opponent.name}'s ${opponentFlawDetails.name} flaw applies a stat penalty!`);
    }

  }, [player, opponent, addLog, fatalFlaws]); // Removed combatLog from deps as addLog is stable

  // Scroll combat log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logMessages]);


  // Handles a turn for the active combatant
  const handleTurn = useCallback(async (action, abilityName = null) => {
    // Determine current attacker and defender
    let currentAttackerChar = currentAttackerId === 'player' ? { ...player, activeBuffs: playerBuffsDebuffs } : { ...opponent, activeBuffs: opponentBuffsDebuffs };
    let currentDefenderChar = currentAttackerId === 'player' ? { ...opponent, activeBuffs: opponentBuffsDebuffs } : { ...player, activeBuffs: playerBuffsDebuffs };

    // Update ability states for current attacker
    const currentAttackerAbilityStates = currentAttackerId === 'player' ? { ...playerAbilityStates } : { ...opponentAbilityStates };
    const setAttackerAbilityStates = currentAttackerId === 'player' ? setPlayerAbilityStates : setOpponentAbilityStates;

    const setDefenderHP = currentAttackerId === 'player' ? setCurrentOpponentHP : setCurrentPlayerHP;
    const currentDefenderHP = currentAttackerId === 'player' ? currentOpponentHP : currentPlayerHP;


    // 1. Decrement cooldowns and buff/debuff durations for the character whose turn it IS
    // Filter out expired buffs/debuffs for the attacker
    const nextAttackerBuffsDebuffs = currentAttackerChar.activeBuffs.filter(effect => {
        if (effect.duration !== -1) { // -1 duration means permanent for battle
            effect.duration--;
        }
        return effect.duration !== 0;
    });
    currentAttackerId === 'player' ? setPlayerBuffsDebuffs(nextAttackerBuffsDebuffs) : setOpponentBuffsDebuffs(nextAttackerBuffsDebuffs);
    currentAttackerChar.activeBuffs = nextAttackerBuffsDebuffs; // Ensure calculations use updated buffs


    // Also apply for defender, as debuffs on them might tick down
    const nextDefenderBuffsDebuffs = currentDefenderChar.activeBuffs.filter(effect => {
      if (effect.duration !== -1) {
          effect.duration--;
      }
      return effect.duration !== 0;
    });
    currentAttackerId === 'player' ? setOpponentBuffsDebuffs(nextDefenderBuffsDebuffs) : setPlayerBuffsDebuffs(nextDefenderBuffsDebuffs);
    currentDefenderChar.activeBuffs = nextDefenderBuffsDebuffs;


    addLog(`--- Turn ${combatTurn}: ${currentAttackerChar.name}'s turn ---`);

    // 2. Apply Fatal Flaw effects that trigger at start of turn
    const attackerFlawDetails = fatalFlaws.find(f => f.name === currentAttackerChar["Fatal Flaw"]);
    if (attackerFlawDetails?.combatEffect) {
        if (attackerFlawDetails.combatEffect.selfDamageChance && Math.random() < attackerFlawDetails.combatEffect.selfDamageChance) {
            const damage = attackerFlawDetails.combatEffect.selfDamageAmount;
            // Apply self damage to the current attacker's HP
            if (currentAttackerId === 'player') {
              setCurrentPlayerHP(prevHP => Math.max(0, prevHP - damage));
            } else {
              setCurrentOpponentHP(prevHP => Math.max(0, prevHP - damage));
            }
            addLog(`${currentAttackerChar.name}'s ${attackerFlawDetails.name} flaw caused ${currentAttackerChar.name} to take ${damage} self-damage!`);
        }
        if (attackerFlawDetails.combatEffect.forcedAttackChance && Math.random() < attackerFlawDetails.combatEffect.forcedAttackChance) {
            action = 'attack'; // Force attack
            addLog(`${currentAttackerChar.name}'s ${attackerFlawDetails.name} flaw forced an attack!`);
        }
        if (attackerFlawDetails.combatEffect.abilityFailChance && action === 'ability' && Math.random() < attackerFlawDetails.combatEffect.abilityFailChance) {
            addLog(`${currentAttackerChar.name}'s ${attackerFlawDetails.name} flaw caused the ability to fail!`);
            // Skip ability effect application
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCombatTurn(prev => prev + 1);
            setCurrentAttackerId(prev => prev === 'player' ? 'opponent' : 'player');
            setIsPlayerTurn(prev => !prev);
            setShowAbilitySelection(false);
            return; // End turn early
        }
    }

    // 3. Process action
    const chosenAbility = abilityName ? specialAbilities.find(ab => ab.name === abilityName) : null;

    if (action === 'ability' && chosenAbility) {
      const abilState = currentAttackerAbilityStates[chosenAbility.name];
      if (abilState && (abilState.cooldown > 0 || (abilState.usesLeft !== -1 && abilState.usesLeft === 0))) {
          addLog(`${currentAttackerChar.name}'s ${chosenAbility.name} is not ready!`);
          // This should not happen if buttons are disabled correctly
      } else {
          addLog(`${currentAttackerChar.name} uses ${chosenAbility.name}!`);
          // Apply ability effects
          if (chosenAbility.type === "healing") {
            const healingAmount = Math.abs(chosenAbility.power);
            const targetHPSetter = currentAttackerId === 'player' ? setCurrentPlayerHP : setCurrentOpponentHP;
            const targetCurrentHP = currentAttackerId === 'player' ? currentPlayerHP : currentOpponentHP;
            targetHPSetter(Math.min(currentAttackerChar.maxHP, targetCurrentHP + healingAmount));
            addLog(`${currentAttackerChar.name} heals for ${healingAmount} HP!`);
          } else if (chosenAbility.type === "magical" || chosenAbility.type === "physical") {
              const damage = (chosenAbility.type === "magical" ? calculateMagicalDamage : calculatePhysicalDamage)(currentAttackerChar, currentDefenderChar, chosenAbility, chosenAbility.element || null);
              setDefenderHP(prevHP => Math.max(0, prevHP - damage));
              addLog(`${currentAttackerChar.name} deals ${damage} damage to ${currentDefenderChar.name}!`);
          } else if (chosenAbility.type === "utility" || chosenAbility.type === "defensive") {
              // Apply buff/debuff effects
              if (chosenAbility.effect?.skipOpponentTurns) {
                  addLog(`${currentDefenderChar.name}'s next ${chosenAbility.effect.skipOpponentTurns} turns are skipped! (Feature to be fully implemented)`);
              }
              if (chosenAbility.effect?.tempStrBoost) {
                  addLog(`${currentAttackerChar.name} gains ${chosenAbility.effect.tempStrBoost} Strength for ${chosenAbility.effect.duration} turns!`);
                  setAttackerBuffsDebuffs(prev => [...prev, { type: "statBoost", stat: "Strength", value: chosenAbility.effect.tempStrBoost, duration: chosenAbility.effect.duration }]);
              }
              if (chosenAbility.effect?.damageReduction) {
                  addLog(`${currentAttackerChar.name} gains ${chosenAbility.effect.damageReduction * 100}% damage reduction for ${chosenAbility.effect.duration} turns!`);
                  setAttackerBuffsDebuffs(prev => [...prev, { type: "damageReduction", value: chosenAbility.effect.damageReduction, duration: chosenAbility.effect.duration }]);
              }
              if (chosenAbility.effect?.highDodgeChance) {
                  addLog(`${currentAttackerChar.name} gains significantly increased dodge chance for ${chosenAbility.effect.duration} turns!`);
                  setAttackerBuffsDebuffs(prev => [...prev, { type: "dodgeBoost", value: chosenAbility.effect.highDodgeChance, duration: chosenAbility.effect.duration }]);
              }
              if (chosenAbility.effect?.revive) {
                addLog(`${currentAttackerChar.name} will revive with ${chosenAbility.effect.hpRestore * 100}% HP upon defeat! (One time effect)`);
                setAttackerBuffsDebuffs(prev => [...prev, { type: "revive", value: chosenAbility.effect.hpRestore, duration: 1 }]);
              }
          }

          // Update ability usage
          if (abilState) {
            abilState.cooldown = chosenAbility.cooldown;
            if (chosenAbility.usesPerMatch !== -1) {
              abilState.usesLeft--;
            }
            setAttackerAbilityStates({ ...currentAttackerAbilityStates });
          }
      } else if (action === 'attack') {
        const damage = calculatePhysicalDamage(currentAttackerChar, currentDefenderChar, currentAttackerChar.weaponDetails?.type || null);
        const dodgeChance = getDodgeChance(currentAttackerChar.Stats, currentDefenderChar.Stats, { name: currentAttackerChar["Weapon Type"], mastery: currentAttackerChar["Weapon Mastery"] });
        const dodged = randomInt(1, 100) <= dodgeChance;

        if (dodged) {
          addLog(`${currentDefenderChar.name} dodged the attack!`);
        } else {
          setDefenderHP(prevHP => Math.max(0, prevHP - damage));
          addLog(`${currentAttackerChar.name} attacks ${currentDefenderChar.name} for ${damage} damage!`);
        }
      } else if (action === 'defend') {
        addLog(`${currentAttackerChar.name} is defending!`);
        setAttackerBuffsDebuffs(prev => [...prev, { type: "defending", duration: 1 }]);
      }

      // Check for combat end (re-evaluate HP after action)
      const latestPlayerHP = currentAttackerId === 'player' ? currentPlayerHP : currentOpponentHP;
      const latestOpponentHP = currentAttackerId === 'player' ? currentOpponentHP : currentPlayerHP;


      if (latestPlayerHP <= 0 || latestOpponentHP <= 0) {
          const winner = latestPlayerHP <= 0 ? 'opponent' : 'player';
          const defeatedChar = winner === 'opponent' ? player : opponent;
          const defeatedCharSetHP = winner === 'opponent' ? setCurrentPlayerHP : setCurrentOpponentHP;
          const defeatedCharBuffs = winner === 'opponent' ? playerBuffsDebuffs : opponentBuffsDebuffs;
          const setDefeatedCharBuffs = winner === 'opponent' ? setPlayerBuffsDebuffs : setOpponentBuffsDebuffs;

          const reviveBuffIndex = defeatedCharBuffs.findIndex(b => b.type === "revive");
          if (reviveBuffIndex !== -1) {
              addLog(`${defeatedChar.name} uses Phoenix Rebirth to revive!`);
              const reviveHP = Math.round(defeatedChar.maxHP * defeatedCharBuffs[reviveBuffIndex].value);
              defeatedCharSetHP(reviveHP);
              const updatedBuffs = [...defeatedCharBuffs];
              updatedBuffs.splice(reviveBuffIndex, 1);
              setDefeatedCharBuffs(updatedBuffs);
              await new Promise(resolve => setTimeout(resolve, 1500));
              setCombatTurn(prev => prev + 1);
              setCurrentAttackerId(prev => prev === 'player' ? 'opponent' : 'player');
              setIsPlayerTurn(prev => !prev);
              setShowAbilitySelection(false);
              return;
          }

          addLog("Combat ended!");
          await new Promise(resolve => setTimeout(resolve, 1500));
          onCombatEnd(winner, winner === 'player' ? player : opponent);
          return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      setCombatTurn(prev => prev + 1);
      setCurrentAttackerId(prev => prev === 'player' ? 'opponent' : 'player');
      setIsPlayerTurn(prev => !prev);
      setShowAbilitySelection(false);
    }, [player, opponent, currentAttackerId, combatTurn, addLog, calculatePhysicalDamage, calculateMagicalDamage, getDodgeChance, currentPlayerHP, currentOpponentHP, specialAbilities, fatalFlaws,
        playerAbilityStates, opponentAbilityStates, playerBuffsDebuffs, opponentBuffsDebuffs, setCurrentPlayerHP, setCurrentOpponentHP, onClose, onCombatEnd, getEffectiveStats, weaponTypes, weaponMasteryValues];


    // AI's Turn Logic (runs when it's opponent's turn)
    useEffect(() => {
      if (currentAttackerId === 'opponent' && currentPlayerHP > 0 && currentOpponentHP > 0) {
        const opponentChar = opponent;
        // const playerChar = player; // Removed unused playerChar

        let aiAction = 'attack'; // Default to attack

        const opponentAbilState = opponentAbilityStates[opponentChar.abilityDetails?.name];
        const canUseAbility = opponentChar.abilityDetails && opponentChar.abilityDetails.name !== "None" && combatTurn > 1 &&
                              (!opponentAbilState || (opponentAbilState.cooldown === 0 && (opponentAbilState.usesLeft > 0 || opponentChar.abilityDetails.usesPerMatch === -1)));

        if (canUseAbility) {
          if (opponentChar.abilityDetails.type === "healing" && currentOpponentHP / opponent.maxHP < 0.5) {
            aiAction = 'ability';
          } else if (opponentChar.abilityDetails.type === "magical" || opponentChar.abilityDetails.type === "physical") {
            if (opponentChar.currentHP / opponent.maxHP > 0.7 && currentPlayerHP / player.maxHP < 0.3) {
              aiAction = 'ability';
            }
          } else if (opponentChar.abilityDetails.type === "defensive") {
              if (opponentChar.currentHP / opponent.maxHP < 0.6 && !opponentBuffsDebuffs.some(b => b.type === "defending")) {
                  aiAction = 'ability';
              }
          } else if (opponentChar.abilityDetails.type === "utility" && opponentChar.abilityDetails.name === "Time Stop") {
              if (combatTurn < 5 && opponentAbilState.usesLeft > 0) {
                  aiAction = 'ability';
              }
          }
        } else if (currentOpponentHP / opponent.maxHP < 0.4 && randomInt(0, 1) === 0) {
          aiAction = 'defend';
        }

        setTimeout(() => handleTurn(aiAction, aiAction === 'ability' ? opponentChar.abilityDetails.name : null), 1500);
      }
    }, [isPlayerTurn, currentAttackerId, currentPlayerHP, currentOpponentHP, handleTurn, opponent, combatTurn, opponentAbilityStates, opponentBuffsDebuffs, player]);


    const playerHPPercent = (currentPlayerHP / player.maxHP) * 100;
    const opponentHPPercent = (currentOpponentHP / opponent.maxHP) * 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-red-700 w-full max-w-4xl h-5/6 flex flex-col">
          <h2 className="text-3xl font-bold text-red-400 text-center mb-4 font-serif">Combat Arena</h2>
          <div className="grid grid-cols-2 gap-4 flex-grow overflow-hidden">
            {/* Player Character */}
            <div className={`bg-gray-900 rounded-lg p-4 flex flex-col items-center border ${currentAttackerId === 'player' ? 'border-yellow-400' : 'border-purple-700'}`}>
              <div className="w-24 h-24 bg-purple-500 rounded-full mb-2 flex items-center justify-center text-xl font-bold">You</div> {/* Player Avatar Placeholder */}
              <h3 className="text-xl font-bold text-yellow-300">{player.name}</h3>
              <p className="text-lg text-gray-200">HP: {currentPlayerHP}/{player.maxHP}</p>
              <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${playerHPPercent}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {playerBuffsDebuffs.map((buff, idx) => (
                  <span key={idx} className="mr-2 px-2 py-1 bg-blue-700 rounded-md">{buff.type} {buff.duration !== -1 ? `(${buff.duration})` : ''}</span>
                ))}
              </div>
            </div>

            {/* Opponent Character */}
            <div className={`bg-gray-900 rounded-lg p-4 flex flex-col items-center border ${currentAttackerId === 'opponent' ? 'border-yellow-400' : 'border-red-700'}`}>
              <div className="w-24 h-24 bg-red-500 rounded-full mb-2 flex items-center justify-center text-xl font-bold">AI</div> {/* Opponent Avatar Placeholder */}
              <h3 className="text-xl font-bold text-yellow-300">{opponent.name}</h3>
              <p className="text-lg text-gray-200">HP: {currentOpponentHP}/{opponent.maxHP}</p>
              <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${opponentHPPercent}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {opponentBuffsDebuffs.map((buff, idx) => (
                  <span key={idx} className="mr-2 px-2 py-1 bg-blue-700 rounded-md">{buff.type} {buff.duration !== -1 ? `(${buff.duration})` : ''}</span>
                ))}
              </div>
            </div>

            {/* Combat Log */}
            <div className="col-span-2 bg-gray-700 rounded-lg p-3 border border-gray-600 overflow-y-auto max-h-40" ref={logRef}>
              {logMessages.map((msg, index) => (
                <p key={index} className="text-sm text-gray-300"><ChevronRight size={14} className="inline-block mr-1 text-blue-300" />{msg}</p>
              ))}
            </div>

            {/* Player Actions */}
            <div className="col-span-2 text-center mt-4">
              <h3 className="text-xl font-bold text-blue-300 mb-2">Your Turn!</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleTurn('attack')}
                  disabled={!isPlayerTurn || currentPlayerHP <= 0 || currentOpponentHP <= 0}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400 transition-colors flex items-center gap-2"
                >
                  <Sword size={20} /> Attack
                </button>
                <button
                  onClick={() => handleTurn('defend')}
                  disabled={!isPlayerTurn || currentPlayerHP <= 0 || currentOpponentHP <= 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 transition-colors flex items-center gap-2"
                >
                  <Shield size={20} /> Defend
                </button>
                <button
                  onClick={() => setShowAbilitySelection(true)}
                  disabled={!isPlayerTurn || currentPlayerHP <= 0 || currentOpponentHP <= 0 || combatTurn === 1}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 transition-colors flex items-center gap-2"
                >
                  <Zap size={20} /> Abilities
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-3 bg-gray-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200"
          >
            Leave Combat
          </button>

          {/* Ability Selection Modal */}
          {showAbilitySelection && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border-2 border-purple-700 w-full max-w-lg">
                <h3 className="text-2xl font-bold text-yellow-300 text-center mb-4">Select an Ability</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {player["Special Ability"] && player["Special Ability"] !== "None" ? (
                    (() => {
                      const playerAbility = specialAbilities.find(sa => sa.name === player["Special Ability"]);
                      const abilState = playerAbilityStates[playerAbility.name] || { cooldown: 0, usesLeft: playerAbility.usesPerMatch === -1 ? 999 : playerAbility.usesPerMatch };
                      const isDisabled = abilState.cooldown > 0 || (abilState.usesLeft !== -1 && abilState.usesLeft === 0);
                      const displayUses = playerAbility.usesPerMatch === -1 ? "∞" : abilState.usesLeft;
                      return (
                        <button
                          key={playerAbility.name}
                          onClick={() => handleTurn('ability', playerAbility.name)}
                          disabled={isDisabled}
                          className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors
                            ${isDisabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-purple-800 hover:bg-purple-700 text-white'}`}
                        >
                          <div>
                            <span className="font-bold text-lg">{playerAbility.name}</span>
                            <p className="text-sm text-gray-300">{playerAbility.type === "healing" ? `Heals ${Math.abs(playerAbility.power)} HP` : playerAbility.type === "physical" || playerAbility.type === "magical" ? `Deals ${playerAbility.power} damage` : playerAbility.type}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p>CD: {abilState.cooldown}/{playerAbility.cooldown}</p>
                            <p>Uses: {displayUses}{playerAbility.usesPerMatch !== -1 && `/${playerAbility.usesPerMatch}`}</p>
                          </div>
                        </button>
                      );
                    })()
                  ) : (
                    <p className="text-center text-gray-400">You have no special abilities.</p>
                  )}
                </div>
                <button
                  onClick={() => setShowAbilitySelection(false)}
                  className="mt-6 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default CombatArena;
