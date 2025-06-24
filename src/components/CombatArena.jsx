import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, Sword, Shield, Zap, Heart, Clock, Star } from 'lucide-react';
import { fatalFlaws, weaponTypes, weaponMasteryValues, specialAbilities, statNames } from '../gameData.js';
import { randomInt } from '../utils/helpers.js';

const CombatArena = ({ player, opponent, onClose, onCombatEnd, activeQuest, updateQuestProgress }) => {
  // Combat state
  const [currentPlayerHP, setCurrentPlayerHP] = useState(player.currentHP);
  const [currentOpponentHP, setCurrentOpponentHP] = useState(opponent.currentHP);
  const [combatTurn, setCombatTurn] = useState(1);
  const [currentAttackerId, setCurrentAttackerId] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const logRef = useRef(null);
  const [playerAbilityStates, setPlayerAbilityStates] = useState(player.initialAbilityStates || {});
  const [opponentAbilityStates, setOpponentAbilityStates] = useState(opponent.initialAbilityStates || {});
  const [playerBuffsDebuffs, setPlayerBuffsDebuffs] = useState(player.activeBuffs || []);
  const [opponentBuffsDebuffs, setOpponentBuffsDebuffs] = useState(opponent.activeBuffs || []);
  const [showAbilitySelection, setShowAbilitySelection] = useState(false);

  const addLog = useCallback((message) => {
    setLogMessages(prev => [...prev, message]);
  }, []);

  const getEffectiveStats = useCallback((baseStats, buffsDebuffs) => {
    const effectiveStats = { ...baseStats };
    buffsDebuffs.forEach(effect => {
      if (effect.type === "statPenalty" && effect.stat) {
        effectiveStats[effect.stat] = Math.max(0, effectiveStats[effect.stat] + effect.value);
      } else if (effect.type === "statBoost" && effect.stat) {
        effectiveStats[effect.stat] = effectiveStats[effect.stat] + effect.value;
      }
    });
    return effectiveStats;
  }, []);

  const calculatePhysicalDamage = useCallback((attacker, defender, attackTypeElement = null) => {
    const attackerEffectiveStats = getEffectiveStats(attacker.Stats, attacker.activeBuffs);
    const defenderEffectiveStats = getEffectiveStats(defender.Stats, defender.activeBuffs);

    const attackerStrength = attackerEffectiveStats?.Strength || 0;
    const attackerWeapon = attacker["Weapon Yes/No"] === "Yes" ? weaponTypes.find(w => w.name === attacker["Weapon Type"]) : null;
    const attackerMastery = attacker["Weapon Yes/No"] === "Yes" ? weaponMasteryValues[attacker["Weapon Mastery"]] : null;

    let baseDamage = attackerStrength / 5;
    if (attackerWeapon) {
      baseDamage += attackerWeapon.baseDamage;
    }
    if (attackerMastery) {
      baseDamage += attackerMastery.damageBonus;
    }

    const defenderDurability = defenderEffectiveStats?.Durability || 0;
    const damageReductionFactor = defenderDurability / 200;
    let finalDamage = baseDamage * (1 - damageReductionFactor);

    const isDefending = defender.activeBuffs.some(buff => buff.type === 'defending');
    if (isDefending) {
        const defenseBonus = (defenderEffectiveStats.Durability || 0) + (defenderEffectiveStats.Speed || 0) + (defenderEffectiveStats.CombatSkill || 0);
        const defendReduction = defenseBonus / 400;
        finalDamage *= (1 - defendReduction);
        addLog(`${defender.name} defends, reducing incoming damage!`);
    }

    const defenderFlawDetails = fatalFlaws.find(f => f.name === defender["Fatal Flaw"]);
    if (defenderFlawDetails?.combatEffect?.opponentDamageBoost && defenderFlawDetails.combatEffect.appliesToType === attackTypeElement) {
      finalDamage *= (1 + defenderFlawDetails.combatEffect.opponentDamageBoost);
      addLog(`${defender.name}'s ${defenderFlawDetails.name} flaw increased incoming ${attackTypeElement} damage!`);
    }

    return Math.max(1, Math.round(finalDamage));
  }, [weaponTypes, weaponMasteryValues, fatalFlaws, addLog, getEffectiveStats]);

  const calculateMagicalDamage = useCallback((attacker, defender, ability, attackTypeElement = null) => {
    const attackerEffectiveStats = getEffectiveStats(attacker.Stats, attacker.activeBuffs);
    const defenderEffectiveStats = getEffectiveStats(defender.Stats, defender.activeBuffs);

    const attackerIntelligence = attackerEffectiveStats?.Intelligence || 0;
    let baseDamage = attackerIntelligence / 5;
    if (ability) {
      baseDamage += ability.power;
    }

    const defenderDurability = defenderEffectiveStats?.Durability || 0;
    const damageReductionFactor = defenderDurability / 200;
    let finalDamage = baseDamage * (1 - damageReductionFactor);

    const isDefending = defender.activeBuffs.some(buff => buff.type === 'defending');
    if (isDefending) {
        const defenseBonus = (defenderEffectiveStats.Durability || 0) + (defenderEffectiveStats.Speed || 0) + (defenderEffectiveStats.CombatSkill || 0);
        const defendReduction = defenseBonus / 400;
        finalDamage *= (1 - defendReduction);
        addLog(`${defender.name} defends, reducing incoming damage!`);
    }

    const defenderFlawDetails = fatalFlaws.find(f => f.name === defender["Fatal Flaw"]);
    if (defenderFlawDetails?.combatEffect?.opponentDamageBoost && defenderFlawDetails.combatEffect.appliesToType === attackTypeElement) {
      finalDamage *= (1 + defenderFlawDetails.combatEffect.opponentDamageBoost);
      addLog(`${defender.name}'s ${defenderFlawDetails.name} flaw increased incoming ${attackTypeElement} damage!`);
    }

    return Math.max(1, Math.round(finalDamage));
  }, [fatalFlaws, addLog, getEffectiveStats]);

  const getDodgeChance = useCallback((attackerStats, defenderStats, attackerWeaponData) => {
    const baseDodge = 5;

    const defenderSpeed = defenderStats?.Speed || 0;
    const attackerSpeed = attackerStats?.Speed || 0;
    const agilityDifference = defenderSpeed - attackerSpeed;
    let agilityBonus = Math.max(0, agilityDifference / 10);

    let masteryPenalty = 0;
    if (attackerWeaponData?.name && attackerWeaponData?.mastery) {
      masteryPenalty = weaponMasteryValues[attackerWeaponData.mastery]?.dodgePenalty || 0;
    }

    let finalDodgeChance = baseDodge + agilityBonus - masteryPenalty;
    return Math.max(0, Math.min(100, finalDodgeChance));
  }, [weaponMasteryValues]);

  // Initial combat setup
  useEffect(() => {
    const playerSpeed = player.Stats?.Speed || 0;
    const opponentSpeed = opponent.Stats?.Speed || 0;

    let firstAttackerId = 'player';
    if (opponentSpeed > playerSpeed) {
      firstAttackerId = 'opponent';
    } else if (opponentSpeed === playerSpeed) {
      firstAttackerId = randomInt(0, 1) === 0 ? 'player' : 'opponent';
    }

    setCurrentAttackerId(firstAttackerId);
    setIsPlayerTurn(firstAttackerId === 'player');
    addLog(`⚔️ Combat begins! ${firstAttackerId === 'player' ? player.name : opponent.name} strikes first!`);

    // Apply permanent combat effects from flaws
    const playerFlawDetails = fatalFlaws.find(f => f.name === player["Fatal Flaw"]);
    if (playerFlawDetails?.combatEffect?.statPenalty && playerFlawDetails.combatEffect.duration === -1) {
        setPlayerBuffsDebuffs(prev => [...prev, { type: "statPenalty", ...playerFlawDetails.combatEffect.statPenalty, id: "flaw_perm_player" }]);
        addLog(`💀 ${player.name}'s ${playerFlawDetails.name} flaw applies a stat penalty!`);
    }
    const opponentFlawDetails = fatalFlaws.find(f => f.name === opponent["Fatal Flaw"]);
    if (opponentFlawDetails?.combatEffect?.statPenalty && opponentFlawDetails.combatEffect.duration === -1) {
        setOpponentBuffsDebuffs(prev => [...prev, { type: "statPenalty", ...opponentFlawDetails.combatEffect.statPenalty, id: "flaw_perm_opponent" }]);
        addLog(`💀 ${opponent.name}'s ${opponentFlawDetails.name} flaw applies a stat penalty!`);
    }

  }, [player, opponent, addLog, fatalFlaws]);

  // Scroll combat log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logMessages]);

  const handleTurn = useCallback(async (action, abilityName = null) => {
    let currentAttackerChar = currentAttackerId === 'player' ? { ...player, activeBuffs: playerBuffsDebuffs } : { ...opponent, activeBuffs: opponentBuffsDebuffs };
    let currentDefenderChar = currentAttackerId === 'player' ? { ...opponent, activeBuffs: opponentBuffsDebuffs } : { ...player, activeBuffs: playerBuffsDebuffs };

    const currentAttackerAbilityStates = currentAttackerId === 'player' ? { ...playerAbilityStates } : { ...opponentAbilityStates };
    const setAttackerAbilityStates = currentAttackerId === 'player' ? setPlayerAbilityStates : setOpponentAbilityStates;

    const setDefenderHP = currentAttackerId === 'player' ? setCurrentOpponentHP : setCurrentPlayerHP;
    const currentDefenderHP = currentAttackerId === 'player' ? currentOpponentHP : currentPlayerHP;

    // Decrement cooldowns and buff/debuff durations
    const nextAttackerBuffsDebuffs = currentAttackerChar.activeBuffs.filter(effect => {
        if (effect.duration !== -1) {
            effect.duration--;
        }
        return effect.duration !== 0;
    });
    currentAttackerId === 'player' ? setPlayerBuffsDebuffs(nextAttackerBuffsDebuffs) : setOpponentBuffsDebuffs(nextAttackerBuffsDebuffs);
    currentAttackerChar.activeBuffs = nextAttackerBuffsDebuffs;

    const nextDefenderBuffsDebuffs = currentDefenderChar.activeBuffs.filter(effect => {
      if (effect.duration !== -1) {
          effect.duration--;
      }
      return effect.duration !== 0;
    });
    currentAttackerId === 'player' ? setOpponentBuffsDebuffs(nextDefenderBuffsDebuffs) : setPlayerBuffsDebuffs(nextDefenderBuffsDebuffs);
    currentDefenderChar.activeBuffs = nextDefenderBuffsDebuffs;

    addLog(`🎯 Turn ${combatTurn}: ${currentAttackerChar.name}'s turn`);

    // Apply Fatal Flaw effects
    const attackerFlawDetails = fatalFlaws.find(f => f.name === currentAttackerChar["Fatal Flaw"]);
    if (attackerFlawDetails?.combatEffect) {
        if (attackerFlawDetails.combatEffect.selfDamageChance && Math.random() < attackerFlawDetails.combatEffect.selfDamageChance) {
            const damage = attackerFlawDetails.combatEffect.selfDamageAmount;
            if (currentAttackerId === 'player') {
              setCurrentPlayerHP(prevHP => Math.max(0, prevHP - damage));
            } else {
              setCurrentOpponentHP(prevHP => Math.max(0, prevHP - damage));
            }
            addLog(`💀 ${currentAttackerChar.name}'s ${attackerFlawDetails.name} caused ${damage} self-damage!`);
        }
        if (attackerFlawDetails.combatEffect.forcedAttackChance && Math.random() < attackerFlawDetails.combatEffect.forcedAttackChance) {
            action = 'attack';
            addLog(`😤 ${currentAttackerChar.name}'s ${attackerFlawDetails.name} forced an attack!`);
        }
        if (attackerFlawDetails.combatEffect.abilityFailChance && action === 'ability' && Math.random() < attackerFlawDetails.combatEffect.abilityFailChance) {
            addLog(`❌ ${currentAttackerChar.name}'s ${attackerFlawDetails.name} caused the ability to fail!`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCombatTurn(prev => prev + 1);
            setCurrentAttackerId(prev => prev === 'player' ? 'opponent' : 'player');
            setIsPlayerTurn(prev => !prev);
            setShowAbilitySelection(false);
            return;
        }
    }

    // Process action
    const chosenAbility = abilityName ? specialAbilities.find(ab => ab.name === abilityName) : null;

    if (action === 'ability' && chosenAbility) {
      const abilState = currentAttackerAbilityStates[chosenAbility.name];
      if (abilState && (abilState.cooldown > 0 || (abilState.usesLeft !== -1 && abilState.usesLeft === 0))) {
          addLog(`⏳ ${currentAttackerChar.name}'s ${chosenAbility.name} is not ready!`);
      } else {
          addLog(`✨ ${currentAttackerChar.name} uses ${chosenAbility.name}!`);
          if (chosenAbility.type === "healing") {
            const healingAmount = Math.abs(chosenAbility.power);
            const targetHPSetter = currentAttackerId === 'player' ? setCurrentPlayerHP : setCurrentOpponentHP;
            const targetCurrentHP = currentAttackerId === 'player' ? currentPlayerHP : currentOpponentHP;
            targetHPSetter(Math.min(currentAttackerChar.maxHP, targetCurrentHP + healingAmount));
            addLog(`💚 ${currentAttackerChar.name} heals for ${healingAmount} HP!`);
          } else if (chosenAbility.type === "magical" || chosenAbility.type === "physical") {
              const damage = (chosenAbility.type === "magical" ? calculateMagicalDamage : calculatePhysicalDamage)(currentAttackerChar, currentDefenderChar, chosenAbility, chosenAbility.element || null);
              setDefenderHP(prevHP => Math.max(0, prevHP - damage));
              addLog(`💥 ${currentAttackerChar.name} deals ${damage} damage to ${currentDefenderChar.name}!`);
          } else if (chosenAbility.type === "utility" || chosenAbility.type === "defensive") {
              if (chosenAbility.effect?.skipOpponentTurns) {
                  addLog(`⏸️ ${currentDefenderChar.name}'s next ${chosenAbility.effect.skipOpponentTurns} turns are skipped!`);
              }
              if (chosenAbility.effect?.tempStrBoost) {
                  addLog(`💪 ${currentAttackerChar.name} gains ${chosenAbility.effect.tempStrBoost} Strength for ${chosenAbility.effect.duration} turns!`);
                  setAttackerBuffsDebuffs(prev => [...prev, { type: "statBoost", stat: "Strength", value: chosenAbility.effect.tempStrBoost, duration: chosenAbility.effect.duration }]);
              }
              if (chosenAbility.effect?.damageReduction) {
                  addLog(`🛡️ ${currentAttackerChar.name} gains ${chosenAbility.effect.damageReduction * 100}% damage reduction!`);
                  setAttackerBuffsDebuffs(prev => [...prev, { type: "damageReduction", value: chosenAbility.effect.damageReduction, duration: chosenAbility.effect.duration }]);
              }
              if (chosenAbility.effect?.highDodgeChance) {
                  addLog(`💨 ${currentAttackerChar.name} gains increased dodge chance!`);
                  setAttackerBuffsDebuffs(prev => [...prev, { type: "dodgeBoost", value: chosenAbility.effect.highDodgeChance, duration: chosenAbility.effect.duration }]);
              }
              if (chosenAbility.effect?.revive) {
                addLog(`🔥 ${currentAttackerChar.name} will revive with ${chosenAbility.effect.hpRestore * 100}% HP upon defeat!`);
                setAttackerBuffsDebuffs(prev => [...prev, { type: "revive", value: chosenAbility.effect.hpRestore, duration: 1 }]);
              }
          }

          if (abilState) {
            abilState.cooldown = chosenAbility.cooldown;
            if (chosenAbility.usesPerMatch !== -1) {
              abilState.usesLeft--;
            }
            setAttackerAbilityStates({ ...currentAttackerAbilityStates });
          }
      }
    } else if (action === 'attack') {
      const damage = calculatePhysicalDamage(currentAttackerChar, currentDefenderChar, currentAttackerChar.weaponDetails?.type || null);
      const dodgeChance = getDodgeChance(currentAttackerChar.Stats, currentDefenderChar.Stats, { name: currentAttackerChar["Weapon Type"], mastery: currentAttackerChar["Weapon Mastery"] });
      const dodged = randomInt(1, 100) <= dodgeChance;

      if (dodged) {
        addLog(`💨 ${currentDefenderChar.name} dodged the attack!`);
      } else {
        setDefenderHP(prevHP => Math.max(0, prevHP - damage));
        addLog(`⚔️ ${currentAttackerChar.name} attacks ${currentDefenderChar.name} for ${damage} damage!`);
      }
    } else if (action === 'defend') {
      addLog(`🛡️ ${currentAttackerChar.name} takes a defensive stance!`);
      setAttackerBuffsDebuffs(prev => [...prev, { type: "defending", duration: 1 }]);
    }

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
            addLog(`🔥 ${defeatedChar.name} uses Phoenix Rebirth to revive!`);
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

        addLog(`🏁 Combat ended! ${winner === 'player' ? player.name : opponent.name} is victorious!`);
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
      playerAbilityStates, opponentAbilityStates, playerBuffsDebuffs, opponentBuffsDebuffs, setCurrentPlayerHP, setCurrentOpponentHP, onCombatEnd, getEffectiveStats, weaponTypes]);

  // AI's Turn Logic
  useEffect(() => {
    if (currentAttackerId === 'opponent' && currentPlayerHP > 0 && currentOpponentHP > 0) {
      const opponentChar = opponent;

      let aiAction = 'attack';

      const opponentAbilState = opponentAbilityStates[opponentChar.abilityDetails?.name];
      const canUseAbility = opponentChar.abilityDetails && opponentChar.abilityDetails.name !== "None" && combatTurn > 1 &&
                            (!opponentAbilState || (opponentAbilState.cooldown === 0 && (opponentAbilState.usesLeft > 0 || opponentChar.abilityDetails.usesPerMatch === -1)));

      if (canUseAbility) {
        if (opponentChar.abilityDetails.type === "healing" && currentOpponentHP / opponent.maxHP < 0.5) {
          aiAction = 'ability';
        } else if (opponentChar.abilityDetails.type === "magical" || opponentChar.abilityDetails.type === "physical") {
          if (currentOpponentHP / opponent.maxHP > 0.7 && currentPlayerHP / player.maxHP < 0.3) {
            aiAction = 'ability';
          }
        } else if (opponentChar.abilityDetails.type === "defensive") {
            if (currentOpponentHP / opponent.maxHP < 0.6 && !opponentBuffsDebuffs.some(b => b.type === "defending")) {
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
  }, [isPlayerTurn, currentAttackerId, currentPlayerHP, currentOpponentHP, handleTurn, opponent, player, combatTurn, opponentAbilityStates, opponentBuffsDebuffs]);

  const playerHPPercent = (currentPlayerHP / player.maxHP) * 100;
  const opponentHPPercent = (currentOpponentHP / opponent.maxHP) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-fantasy-dark via-gray-900 to-fantasy-dark rounded-2xl shadow-2xl p-6 border-2 border-mystical-ruby w-full max-w-6xl h-5/6 flex flex-col backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-mystical-ruby to-mystical-gold bg-clip-text font-fantasy flex items-center justify-center gap-3">
            <Sword size={40} className="text-mystical-ruby animate-glow" />
            ⚔️ Arena of Legends ⚔️
            <Shield size={40} className="text-mystical-gold animate-glow" />
          </h2>
          <p className="text-mystical-silver font-serif mt-2">Turn {combatTurn} • {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
          
          {/* Player Character */}
          <div className={`bg-gradient-to-br from-mystical-emerald/20 to-mystical-sapphire/20 rounded-xl p-6 flex flex-col items-center border-2 transition-all duration-300 ${currentAttackerId === 'player' ? 'border-mystical-gold shadow-lg shadow-mystical-gold/50' : 'border-mystical-emerald/50'}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-mystical-emerald to-mystical-sapphire rounded-full mb-4 flex items-center justify-center text-2xl font-bold border-2 border-mystical-gold">
              🛡️
            </div>
            <h3 className="text-2xl font-bold text-mystical-gold mb-2 font-fantasy">{player.name}</h3>
            <div className="text-center mb-4">
              <p className="text-lg text-mystical-silver flex items-center gap-2">
                <Heart size={20} className="text-red-400" />
                {currentPlayerHP}/{player.maxHP}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4 mt-2 border border-mystical-gold/30">
                <div
                  className="bg-gradient-to-r from-red-500 to-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${playerHPPercent}%` }}
                ></div>
              </div>
            </div>
            
            {/* Player Buffs/Debuffs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {playerBuffsDebuffs.map((buff, idx) => (
                <span key={idx} className="px-2 py-1 bg-mystical-sapphire/30 rounded-md text-xs text-mystical-silver border border-mystical-sapphire/50">
                  {buff.type} {buff.duration !== -1 ? `(${buff.duration})` : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-gradient-to-br from-fantasy-dark to-gray-900 rounded-xl p-4 border-2 border-mystical-purple/50 overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-mystical-purple mb-3 text-center font-fantasy flex items-center justify-center gap-2">
              <Star size={24} />
              Battle Chronicle
            </h3>
            <div className="flex-grow overflow-y-auto bg-gray-800/50 rounded-lg p-3 border border-mystical-purple/30" ref={logRef}>
              {logMessages.map((msg, index) => (
                <p key={index} className="text-sm text-mystical-silver mb-1 flex items-start gap-2">
                  <ChevronRight size={14} className="text-mystical-gold mt-0.5 flex-shrink-0" />
                  <span>{msg}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Opponent Character */}
          <div className={`bg-gradient-to-br from-mystical-ruby/20 to-mystical-purple/20 rounded-xl p-6 flex flex-col items-center border-2 transition-all duration-300 ${currentAttackerId === 'opponent' ? 'border-mystical-gold shadow-lg shadow-mystical-gold/50' : 'border-mystical-ruby/50'}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-mystical-ruby to-mystical-purple rounded-full mb-4 flex items-center justify-center text-2xl font-bold border-2 border-mystical-gold">
              ⚔️
            </div>
            <h3 className="text-2xl font-bold text-mystical-gold mb-2 font-fantasy">{opponent.name}</h3>
            <div className="text-center mb-4">
              <p className="text-lg text-mystical-silver flex items-center gap-2">
                <Heart size={20} className="text-red-400" />
                {currentOpponentHP}/{opponent.maxHP}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4 mt-2 border border-mystical-gold/30">
                <div
                  className="bg-gradient-to-r from-red-500 to-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${opponentHPPercent}%` }}
                ></div>
              </div>
            </div>
            
            {/* Opponent Buffs/Debuffs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {opponentBuffsDebuffs.map((buff, idx) => (
                <span key={idx} className="px-2 py-1 bg-mystical-ruby/30 rounded-md text-xs text-mystical-silver border border-mystical-ruby/50">
                  {buff.type} {buff.duration !== -1 ? `(${buff.duration})` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Player Actions */}
        {isPlayerTurn && currentPlayerHP > 0 && currentOpponentHP > 0 && (
          <div className="mt-6 bg-gradient-to-r from-mystical-gold/20 to-mystical-silver/20 rounded-xl p-6 border border-mystical-gold/50">
            <h3 className="text-2xl font-bold text-mystical-gold mb-4 text-center font-fantasy">Choose Your Action</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => handleTurn('attack')}
                className="px-6 py-3 bg-gradient-to-r from-mystical-ruby to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-serif border border-mystical-ruby/50"
              >
                <div className="flex items-center gap-2">
                  <Sword size={20} />
                  Attack
                </div>
              </button>
              <button
                onClick={() => handleTurn('defend')}
                className="px-6 py-3 bg-gradient-to-r from-mystical-sapphire to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-serif border border-mystical-sapphire/50"
              >
                <div className="flex items-center gap-2">
                  <Shield size={20} />
                  Defend
                </div>
              </button>
              <button
                onClick={() => setShowAbilitySelection(true)}
                disabled={combatTurn === 1}
                className="px-6 py-3 bg-gradient-to-r from-mystical-purple to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-serif border border-mystical-purple/50"
              >
                <div className="flex items-center gap-2">
                  <Zap size={20} />
                  Abilities
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-serif border border-gray-500"
        >
          Retreat from Battle
        </button>

        {/* Ability Selection Modal */}
        {showAbilitySelection && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-gradient-to-br from-fantasy-dark to-gray-900 rounded-xl shadow-2xl p-6 border-2 border-mystical-purple w-full max-w-lg">
              <h3 className="text-3xl font-bold text-mystical-gold text-center mb-6 font-fantasy">Choose Your Power</h3>
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
                        className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all duration-300 border-2
                          ${isDisabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed border-gray-600' : 'bg-gradient-to-r from-mystical-purple/20 to-mystical-gold/20 hover:from-mystical-purple/30 hover:to-mystical-gold/30 text-mystical-silver border-mystical-purple/50 hover:border-mystical-gold'}`}
                      >
                        <div>
                          <span className="font-bold text-lg text-mystical-gold">{playerAbility.name}</span>
                          <p className="text-sm text-mystical-silver mt-1">
                            {playerAbility.type === "healing" ? `Heals ${Math.abs(playerAbility.power)} HP` : 
                             playerAbility.type === "physical" || playerAbility.type === "magical" ? `Deals ${playerAbility.power} damage` : 
                             playerAbility.type}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="flex items-center gap-1">
                            <Clock size={16} />
                            {abilState.cooldown}/{playerAbility.cooldown}
                          </p>
                          <p>Uses: {displayUses}{playerAbility.usesPerMatch !== -1 && `/${playerAbility.usesPerMatch}`}</p>
                        </div>
                      </button>
                    );
                  })()
                ) : (
                  <p className="text-center text-mystical-silver text-lg py-8">You have no special abilities to use.</p>
                )}
              </div>
              <button
                onClick={() => setShowAbilitySelection(false)}
                className="mt-6 w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-serif"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatArena;