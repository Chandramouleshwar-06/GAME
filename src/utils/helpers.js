// src/utils/helpers.js

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
