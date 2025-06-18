    // src/utils/gameUtils.js - Utility functions and helpers
    import { races, abilities, weaponTypes, weaponGrades, weaponMasteries, weaponMasteryValues, specialAbilities, specialAbilityNexusValues, fatalFlaws, statNames, nexusRankThresholds, itemTypes } from '../data/gameData';

    // Helper function for random integer
    export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Helper function for weighted random choice (for array of {name, weight} objects)
    export const weightedRandom = (options) => {
      if (options.length === 0) return null;
      const totalWeight = options.reduce((sum, item) => sum + item.weight, 0);
      let randomNum = Math.random() * totalWeight;

      for (const item of options) {
        if (randomNum < item.weight) {
          return item.name;
        }
        randomNum -= item.weight;
      }
      return options[0].name; // Fallback
    };

    export const calculateNexusRating = (selectedCharacter) => {
        let rating = 0;
        console.log("--- Starting Nexus Rating Calculation ---");
        console.log("Initial Character:", JSON.parse(JSON.stringify(selectedCharacter))); // Deep copy for logging

        // 1. Base race rarity score
        const raceData = races.find(r => r.name === selectedCharacter.Race);
        const raceScore = raceData ? raceData.rarity : 0; // Default to 0 if race not found
        rating += raceScore;
        console.log(`Race (${selectedCharacter.Race}) Score: ${raceScore}, Current Rating: ${rating}`);

        // 2. Stats contribute (toned down by /8)
        const stats = selectedCharacter.Stats || {};
        let totalStatPoints = 0;
        if (stats) {
          totalStatPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
          const statContribution = totalStatPoints / 8; // Toned down from /5
          rating += statContribution;
          console.log(`Stats (Total: ${totalStatPoints}) Contribution: ${statContribution.toFixed(2)}, Current Rating: ${rating.toFixed(2)}`);
        }

        // 3. Weapon Presence and Mastery Bonus
        if (selectedCharacter["Weapon Yes/No"] === "Yes") {
          rating += 5; // Base +5 for having a weapon
          console.log(`Weapon Presence Bonus: 5, Current Rating: ${rating.toFixed(2)}`);

          const mastery = selectedCharacter["Weapon Mastery"];
          const masteryBonus = weaponMasteryValues[mastery]?.nexusBonus || 0;
          rating += masteryBonus;
          console.log(`Weapon Mastery (${mastery}) Bonus: ${masteryBonus}, Current Rating: ${rating.toFixed(2)}`);
        }

        // 4. Special Ability Bonus (based on rarity/weight - further toned down)
        const specialAbilityName = selectedCharacter.SpecialAbility;
        if (specialAbilityName && specialAbilityName !== "No" && specialAbilityName !== "None") {
          const ability = specialAbilities.find(sa => sa.name === specialAbilityName);
          if (ability) {
            const abilityBonus = specialAbilityNexusValues[ability.weight] || 0;
            rating += abilityBonus;
            console.log(`Special Ability (${specialAbilityName}) Bonus: ${abilityBonus}, Current Rating: ${rating.toFixed(2)}`);
          }
        }

        // 5. Fatal Flaw reduces rating
        const fatalFlawName = selectedCharacter["Fatal Flaw"];
        const fatalFlaw = fatalFlaws.find(f => f.name === fatalFlawName);
        if (fatalFlaw && fatalFlaw.name !== "None") {
          rating -= 10; // -10 penalty for having a fatal flaw
          console.log(`Fatal Flaw (${fatalFlaw.name}) Penalty: -10, Current Rating: ${rating.toFixed(2)}`);
        }

        // Cap max rating to 100 and ensure minimum 0
        rating = Math.max(0, Math.min(100, rating));
        selectedCharacter["Nexus Rating"] = parseFloat(rating.toFixed(2));

        // Assign Nexus Rank
        let rank = "F"; // Default to lowest
        const sortedRanks = Object.entries(nexusRankThresholds).sort(([, thresholdA], [, thresholdB]) => thresholdA - thresholdB);

        for (const [r, threshold] of sortedRanks) {
          if (selectedCharacter["Nexus Rating"] >= threshold) { // Use the final calculated rating for rank
            rank = r;
          } else {
            break; // Stop when rating is below the current threshold
          }
        }
        selectedCharacter["Nexus Rank"] = rank;
        console.log(`Final Nexus Rating: ${selectedCharacter["Nexus Rating"]}, Final Nexus Rank: ${selectedCharacter["Nexus Rank"]}`);
        console.log("--- Nexus Rating Calculation Complete ---");

        return selectedCharacter;
    };

    export const calculateMaxHP = (durability) => {
        const baseHP = 100;
        const durabilityBonus = durability / 100;
        return Math.round(baseHP * (1 + durabilityBonus));
    };

    export const getDodgeChance = (attackerStats, defenderStats, attackerWeaponData) => {
        const baseDodge = 5; // 5%

        // Agility Scaled Bonus (using Speed for agility)
        const defenderSpeed = defenderStats?.Speed || 0;
        const attackerSpeed = attackerStats?.Speed || 0;
        const agilityDifference = defenderSpeed - attackerSpeed;
        let agilityBonus = Math.max(0, agilityDifference / 10); // e.g., 30 diff = 3%

        // Attacker's Weapon Mastery Dodge Reduction
        let masteryPenalty = 0;
        if (attackerWeaponData?.name && attackerWeaponData?.mastery) {
          masteryPenalty = weaponMasteryValues[attackerWeaponData.mastery]?.dodgePenalty || 0;
        }

        let finalDodgeChance = baseDodge + agilityBonus - masteryPenalty;
        return Math.max(0, Math.min(100, finalDodgeChance)); // Clamp between 0 and 100
    };

    export const generateAIOpponent = (playerRank) => {
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
        finalAiChar.name = `AI - ${finalAiChar.Race} ${randomInt(100,999)}`;
        finalAiChar.currentHP = calculateMaxHP(finalAiChar.Stats?.Durability || 0);
        finalAiChar.maxHP = finalAiChar.currentHP;
        finalAiChar.initialAbilityStates = finalAiChar.abilityDetails ? { [finalAiChar.abilityDetails.name]: { cooldown: 0, usesLeft: finalAiChar.abilityDetails.usesPerMatch === -1 ? 999 : finalAiChar.abilityDetails.usesPerMatch } } : {};
        finalAiChar.activeBuffs = [];
        console.log("Generated AI Opponent:", finalAiChar);
        return finalAiChar;
    };


    export const generateWeightedRewards = (level, numRewards = 1) => {
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
    };
    