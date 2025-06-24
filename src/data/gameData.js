    // src/data/gameData.js - Centralized game data and constants

    export const races = [
      { name: "Celestial", weight: 1, rarity: 100 }, { name: "Special-Anime Wheel", weight: 2, rarity: 90 },
      { name: "Demi-God", weight: 2, rarity: 90 }, { name: "Demon", weight: 2, rarity: 85 },
      { name: "Lich", weight: 3, rarity: 80 }, { name: "Genie", weight: 3, rarity: 75 },
      { name: "Vampire", weight: 3, rarity: 75 }, { name: "Werewolf", weight: 4, rarity: 70 },
      { name: "Bird-Men", weight: 5, rarity: 40 }, { name: "Beast-Men", weight: 6, rarity: 40 },
      { name: "Reptilian", weight: 6, rarity: 30 }, { name: "Cyclops", weight: 5, rarity: 30 },
      { name: "Centaur", weight: 4, rarity: 50 }, { name: "Satyrs", weight: 4, rarity: 30 },
      { name: "Fairy", weight: 4, rarity: 50 }, { name: "Fishmen", weight: 3, rarity: 40 },
      { name: "Dragonborn", weight: 3, rarity: 60 }, { name: "Minotaur", weight: 3, rarity: 45 },
      { name: "Troll", weight: 5, rarity: 40 }, { name: "Zombies", weight: 5, rarity: 40 },
      { name: "Ogre", weight: 5, rarity: 30 }, { name: "Half-Elves", weight: 4, rarity: 30 },
      { name: "Half-Orcs", weight: 4, rarity: 30 }, { name: "Gnomes", weight: 5, rarity: 30 },
      { name: "Goblins", weight: 6, rarity: 28 }, { name: "Halflings", weight: 5, rarity: 25 },
      { name: "Orcs", weight: 4, rarity: 23 }, { name: "Dwarfs", weight: 6, rarity: 40 },
      { name: "Elves", weight: 6, rarity: 40 }, { name: "Humans", weight: 8, rarity: 25 }
    ];

    export const abilities = {
      "Celestial": ["Holy Light", "Divine Shield", "Healing Aura"],
      "Special-Anime Wheel": ["Devil Fruit Power", "Shinigami Slash", "Ninja Technique"],
      "Demi-God": ["Immortality", "Godly Strength", "Lightning Strike"],
      "Demon": ["Hellfire", "Shadow Meld", "Fear Induce"],
      "Lich": ["Necromancy", "Soul Drain", "Ice Touch"],
      "Genie": ["Wish Grant", "Invisibility", "Elemental Control"],
      "Vampire": ["Blood Drain", "Hypnosis", "Mist Form"],
      "Werewolf": ["Feral Rage", "Enhanced Senses", "Regeneration"],
      "Bird-Men": ["Flight", "Sonic Screech", "Sharp Vision"],
      "Beast-Men": ["Claw Swipe", "Pack Tactics", "Savage Roar"],
      "Reptilian": ["Camouflage", "Poison Bite", "Tail Whip"],
      "Cyclops": ["Giant Strength", "One Eye Stare", "Earthquake Stomp"],
      "Centaur": ["Bow Mastery", "Gallop Charge", "Forest Camouflage"],
      "Satyrs": ["Charm", "Nature's Song", "Trickster's Step"],
      "Fairy": ["Magic Dust", "Flight", "Illusion"],
      "Fishmen": ["Water Breathing", "Tidal Wave", "Aquatic Agility"],
      "Dragonborn": ["Fire Breath", "Scale Armor", "Wing Flap"],
      "Minotaur": ["Labyrinth Runner", "Horn Charge", "Bull Strength"],
      "Troll": ["Regenerate", "Stone Skin", "Club Smash"],
      "Zombies": ["Undead Resilience", "Infectious Bite", "Groan"],
      "Ogre": ["Heavy Smash", "Thick Hide", "Brute Force"],
      "Half-Elves": ["Diplomacy", "Keen Sight", "Quick Reflexes"],
      "Half-Orcs": ["Savage Strike", "Intimidate", "Endurance"],
      "Gnomes": ["Inventor", "Sneak", "Trick Gadgets"],
      "Goblins": ["Ambush", "Steal", "Quick Escape"],
      "Halflings": ["Luck", "Hide", "Quick Hands"],
      "Orcs": ["Berserk", "War Cry", "Smash"],
      "Dwarfs": ["Forge Master", "Sturdy", "Axe Throw"],
      "Elves": ["Archery", "Nature Magic", "Stealth"],
      "Humans": ["Versatility", "Adaptation", "Leadership"]
    };

    export const weaponYesNo = [{ name: "Yes", weight: 4 }, { name: "No", weight: 6 }];
    export const weaponTypes = [
      { name: "Sword", weight: 6, baseDamage: 10, type: "physical" }, { name: "Axe", weight: 5, baseDamage: 12, type: "physical" }, { name: "Bow", weight: 5, baseDamage: 8, type: "physical" },
      { name: "Staff", weight: 4, baseDamage: 7, type: "magical" }, { name: "Dagger", weight: 3, baseDamage: 6, type: "physical" }, { name: "Mace", weight: 3, baseDamage: 11, type: "physical" },
      { name: "Spear", weight: 3, baseDamage: 9, type: "physical" }, { name: "Crossbow", weight: 1, baseDamage: 10, type: "physical" },
      { name: "Scythe", weight: 3, baseDamage: 13, type: "physical" }, { name: "Whip", weight: 2, baseDamage: 5, type: "physical" }, { name: "Chakram", weight: 2, baseDamage: 7, type: "physical" },
      { name: "Twin Blades", weight: 4, baseDamage: 9, type: "physical" }, { name: "Hammer", weight: 3, baseDamage: 14, type: "physical" }, { name: "Gunblade", weight: 1, baseDamage: 15, type: "physical" }
    ];
    export const weaponGrades = [
      { name: "Common", weight: 15 }, { name: "Uncommon", weight: 10 }, { name: "Rare", weight: 7 },
      { name: "Epic", weight: 5 }, { name: "Legendary", weight: 2 }, { name: "Mythic", weight: 1 }
    ];
    export const weaponMasteries = [
      { name: "Novice", weight: 6 }, { name: "Apprentice", weight: 5 }, { name: "Adept", weight: 4 },
      { name: "Expert", weight: 3 }, { name: "Master", weight: 2 }, { name: "Grandmaster", weight: 1 }
    ];
    export const weaponMasteryValues = {
      "Novice": { nexusBonus: 1, dodgePenalty: 1, damageBonus: 2 },
      "Apprentice": { nexusBonus: 2, dodgePenalty: 2, damageBonus: 4 },
      "Adept": { nexusBonus: 3, dodgePenalty: 3, damageBonus: 6 },
      "Expert": { nexusBonus: 4, dodgePenalty: 4, damageBonus: 8 },
      "Master": { nexusBonus: 5, dodgePenalty: 5, damageBonus: 10 },
      "Grandmaster": { nexusBonus: 7, dodgePenalty: 7, damageBonus: 15 },
    };

    export const specialAbilityYesNo = [{ name: "Yes", weight: 2 }, { name: "No", weight: 8 }];
    export const specialAbilities = [
      { name: "Fireball", weight: 10, power: 20, cooldown: 2, usesPerMatch: -1, type: "magical", element: "fire" },
      { name: "Teleportation", weight: 8, power: 0, cooldown: 3, usesPerMatch: 2, type: "utility" },
      { name: "Time Stop", weight: 1, power: 0, cooldown: 999, usesPerMatch: 1, type: "utility", effect: { skipOpponentTurns: 3 } },
      { name: "Invisibility", weight: 5, power: 0, cooldown: 3, usesPerMatch: 1, type: "utility" },
      { name: "Mind Control", weight: 4, power: 0, cooldown: 5, usesPerMatch: 1, type: "utility" },
      { name: "Earthquake", weight: 3, power: 30, cooldown: 4, usesPerMatch: 1, type: "magical", element: "earth" },
      { name: "Healing", weight: 2, power: -40, cooldown: 3, usesPerMatch: 2, type: "healing" },
      { name: "Lightning Bolt", weight: 6, power: 25, cooldown: 2, usesPerMatch: -1, type: "magical", element: "lightning" },
      { name: "Shadow Manipulation", weight: 7, power: 15, cooldown: 2, usesPerMatch: -1, type: "magical", element: "shadow" },
      { name: "Cryokinesis", weight: 6, power: 22, cooldown: 2, usesPerMatch: -1, type: "magical", element: "ice" },
      { name: "Shapeshifting", weight: 5, power: 0, cooldown: 4, usesPerMatch: 1, type: "utility" },
      { name: "Super Strength", weight: 9, power: 0, cooldown: 4, usesPerMatch: 1, type: "physical", effect: { tempStrBoost: 20, duration: 2 } },
      { name: "Flight", weight: 8, power: 0, cooldown: 5, usesPerMatch: 1, type: "utility" },
      { name: "Regenerative Healing", weight: 7, power: -15, cooldown: 3, usesPerMatch: -1, type: "healing" },
      { name: "Shadow Clone", weight: 6, power: 10, cooldown: 3, usesPerMatch: 1, type: "physical" },
      { name: "Arcane Barrage", weight: 4, power: 35, cooldown: 3, usesPerMatch: 1, type: "magical" },
      { name: "Phoenix Rebirth", weight: 2, power: 0, cooldown: 999, usesPerMatch: 1, type: "healing", effect: { revive: true, hpRestore: 0.5 } },
      { name: "Soul Shatter", weight: 1, power: 50, cooldown: 999, usesPerMatch: 1, type: "magical" },
      { name: "Temporal Warp", weight: 3, power: 0, cooldown: 4, usesPerMatch: 1, type: "utility", effect: { nextTurnFaster: true } },
      { name: "Blood Pact", weight: 5, power: 0, cooldown: 4, usesPerMatch: 1, type: "physical", effect: { selfDamage: 10, damageBoost: 1.5 } },
      { name: "Stormcaller’s Wrath", weight: 3, power: 30, cooldown: 3, usesPerMatch: 1, type: "magical", element: "lightning" },
      { name: "Dragon’s Roar", weight: 2, power: 25, cooldown: 3, usesPerMatch: 1, type: "physical", element: "fire" },
      { name: "Celestial Shield", weight: 6, power: 0, cooldown: 2, usesPerMatch: -1, type: "defensive", effect: { damageReduction: 0.5, duration: 1 } },
      { name: "Void Step", weight: 1, power: 0, cooldown: 999, usesPerMatch: 1, type: "utility", effect: { highDodgeChance: 0.9, duration: 1 } }
    ];
    export const specialAbilityNexusValues = {
      1: 10, 2: 8, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1, 9: 0, 10: 0,
    };

    export const fatalFlaws = [
      { name: "None", combatEffect: null },
      { name: "Arrogance", combatEffect: { selfDamageChance: 0.1, selfDamageAmount: 5 } },
      { name: "Impulsiveness", combatEffect: { forcedAttackChance: 0.15 } },
      { name: "Fear of Water", combatEffect: { opponentDamageBoost: 0.1, appliesToType: "water" } },
      { name: "Fragile Ego", combatEffect: { critReceivedBoost: 0.1 } },
      { name: "Naivety", combatEffect: { debuffDurationBoost: 1 } },
      { name: "Curse of Weakness", combatEffect: { statPenalty: { Strength: -5, CombatSkill: -5 }, duration: -1 } },
      { name: "Dark Secret", combatEffect: { defenseReductionChance: 0.05, defenseReductionAmount: 0.2, duration: 1 } },
      { name: "Overconfidence", combatEffect: { abilityFailChance: 0.1 } },
      { name: "Kleptomania", combatEffect: { lootDropPenalty: 0.2 } },
      { name: "Compulsive Liar", combatEffect: { socialSkillPenalty: 0.1 } },
      { name: "Claustrophobia", combatEffect: { environmentPenalty: "confined", statPenalty: { Speed: -10 }, duration: -1 } },
      { name: "Fear of Heights", combatEffect: { environmentPenalty: "high", statPenalty: { CombatSkill: -10 }, duration: -1 } }
    ];

    export const statNames = ["Strength", "Intelligence", "Speed", "Durability", "Combat Skill"];

    export const steps = [
      "Race", "Ability", "Stats", "Weapon Yes/No",
      "Weapon Type", "Weapon Grade", "Weapon Mastery",
      "Special Ability Yes/No", "Special Ability", "Fatal Flaw"
    ];

    export const nexusRankThresholds = {
      "F": 0, "E": 40, "D": 50, "C": 60, "B": 70, "A": 80, "S": 90, "SS/S+": 95,
    };

    export const levelUpThresholds = {
      1: 100, 2: 250, 3: 450, 4: 700, 5: 1000, 6: 1350, 7: 1750, 8: 2200, 9: 2700, 10: 3250,
    };

    export const itemTypes = {
      "weapon": [
        { name: "Rusty Sword", rarity: "Common", statBonus: { Strength: 2 }, stackable: false, baseDamage: 8 },
        { name: "Iron Axe", rarity: "Common", statBonus: { Strength: 3 }, stackable: false, baseDamage: 10 },
        { name: "Longbow", rarity: "Uncommon", statBonus: { Speed: 4, Intelligence: 2 }, stackable: false, baseDamage: 12 },
        { name: "Enchanted Staff", rarity: "Rare", statBonus: { Intelligence: 7, CombatSkill: 3 }, stackable: false, baseDamage: 15 },
        { name: "Dragonfang Dagger", rarity: "Epic", statBonus: { Speed: 10, CombatSkill: 5 }, stackable: false, baseDamage: 20 },
        { name: "Sword of a Thousand Truths", rarity: "Legendary", statBonus: { Strength: 15, Intelligence: 10, Durability: 5 }, stackable: false, baseDamage: 30 },
        { name: "Soul Reaver Scythe", rarity: "Mythic", statBonus: { Strength: 20, CombatSkill: 20, Speed: -5 }, stackable: false, baseDamage: 40 }
      ],
      "armor": [
        { name: "Tattered Clothes", rarity: "Common", statBonus: { Durability: 1 }, stackable: false },
        { name: "Leather Vest", rarity: "Common", statBonus: { Durability: 3 }, stackable: false },
        { name: "Chainmail Armor", rarity: "Uncommon", statBonus: { Durability: 8, Speed: -1 }, stackable: false },
        { name: "Plate Armor", rarity: "Rare", statBonus: { Durability: 15, Speed: -3 }, stackable: false },
        { name: "Dragonhide Vest", rarity: "Epic", statBonus: { Durability: 20, CombatSkill: 5 }, stackable: false },
        { name: "Celestial Aegis", rarity: "Legendary", statBonus: { Durability: 30, Intelligence: 10 }, stackable: false },
        { name: "Void Forged Cuirass", rarity: "Mythic", statBonus: { Durability: 40, Speed: -10, CombatSkill: 15 }, stackable: false }
      ],
      "artifact": [
        { name: "Minor Healing Totem", rarity: "Common", effect: "Restore 10 HP per turn for 3 turns", stackable: false },
        { name: "Orb of Foresight", rarity: "Uncommon", statBonus: { Intelligence: 5 }, stackable: false },
        { name: "Tome of Ancient Knowledge", rarity: "Rare", statBonus: { Intelligence: 10, XP_Gain_Boost: 0.1 }, stackable: false },
        { name: "Crystal of Resilience", rarity: "Epic", statBonus: { Durability: 15, damageReduction: 0.1 }, stackable: false },
        { name: "Phoenix Feather", rarity: "Legendary", effect: "Revive once with 50% HP", stackable: false },
        { name: "Chronos Shard", rarity: "Mythic", statBonus: { Speed: 25 }, effect: "Time Stop ability usable once per combat for free", stackable: false }
      ],
      "magic_item": [
        { name: "Minor Mana Potion", rarity: "Common", uses: 1, effect: "Restore 20 Mana", stackable: true },
        { name: "Basic Healing Potion", rarity: "Common", uses: 1, effect: "Heal 20 HP", stackable: true },
        { name: "Scroll of Blinding Light", rarity: "Uncommon", uses: 1, effect: "Blind opponent for 1 turn", stackable: true },
      ],
      "loot": [
        { name: "Gold Coin", rarity: "Common", value: 1, stackable: true },
        { name: "Silver Nugget", rarity: "Uncommon", value: 5, stackable: true },
        { name: "Rare Gemstone", rarity: "Rare", value: 50, stackable: true },
        { name: "Mystic Dust", rarity: "Epic", value: 100, stackable: true }
      ],
      "stat_point_item": [
        { name: "Minor Stat Crystal", rarity: "Rare", value: 1, type: "stat_point_item", stackable: true },
        { name: "Greater Stat Crystal", rarity: "Epic", value: 3, type: "stat_point_item", stackable: true },
        { name: "Perfect Stat Crystal", rarity: "Legendary", value: 5, type: "stat_point_item", stackable: true },
      ]
    };

    export const questTemplates = [
      {
        type: "Battle Quest",
        name: "Orc Scourge",
        description: "Win {num} fights against Orcs in the Dark Forest.",
        rankRequired: "F",
        rewards: { xp: 50, numItems: 1, itemRarity: "Common" },
        specifics: { enemyType: "Orcs", winsRequired: 3, location: "Dark Forest" },
        progress: { currentWins: 0 }
      },
      {
        type: "Battle Quest",
        name: "Goblin Menace",
        description: "Defeat {num} Goblin patrols in the Whispering Caves.",
        rankRequired: "F",
        rewards: { xp: 40, numItems: 1, itemRarity: "Uncommon" },
        specifics: { enemyType: "Goblins", winsRequired: 5, location: "Whispering Caves" },
        progress: { currentWins: 0 }
      },
      {
        type: "Exploration Quest",
        name: "Wastelands Survival",
        description: "Survive {num} rounds in the Wastelands Arena.",
        rankRequired: "E",
        rewards: { xp: 75, numItems: 1, itemRarity: "Rare" },
        specifics: { roundsToSurvive: 5, location: "Wastelands Arena" },
        progress: { currentRounds: 0 }
      },
      {
        type: "Stat Training",
        name: "Master Your Speed",
        description: "Train your Speed. Costs {cost} Gold to gain +{statGain} Speed. (Max 90)",
        rankRequired: "D",
        rewards: { stat: "Speed", value: 2 },
        costs: { gold: 50 },
        specifics: { statToTrain: "Speed", statGain: 2 }
      },
      {
        type: "Ability Trials",
        name: "Arcane Mastery",
        description: "Win {num} battles using only abilities (no basic attacks).",
        rankRequired: "C",
        rewards: { xp: 120, newAbility: "Random" },
        specifics: { winsRequired: 3, abilityOnly: true },
        progress: { currentWins: 0 }
      },
      {
        type: "Flaw Redemption",
        name: "Conquer Your Fear",
        description: "Win {num} battles while having the '{flaw}' flaw.",
        rankRequired: "B",
        rewards: { xp: 150, removesFlaw: true },
        specifics: { winsRequired: 3, flawToRedeem: "Fear of Water" },
        progress: { currentWins: 0 }
      },
    ];
    