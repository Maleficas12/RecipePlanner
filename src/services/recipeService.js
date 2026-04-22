export class RecipeService {
  constructor(recipeRepository) {
    this.repository = recipeRepository;
    this.recipes = this.repository.loadRecipes();
  }

  list() {
    return [...this.recipes];
  }

  upsert(recipePayload) {
    const normalized = this.repository.validateRecipe(recipePayload);
    const existingIndex = this.recipes.findIndex((recipe) => recipe.id === normalized.id);

    if (existingIndex >= 0) {
      this.recipes.splice(existingIndex, 1, normalized);
    } else {
      this.recipes.unshift(normalized);
    }

    this.repository.saveRecipes(this.recipes);
    return normalized;
  }

  remove(recipeId) {
    this.recipes = this.recipes.filter((recipe) => recipe.id !== recipeId);
    this.repository.saveRecipes(this.recipes);
  }

  getRandom() {
    if (!this.recipes.length) return null;
    const randomIndex = Math.floor(Math.random() * this.recipes.length);
    return this.recipes[randomIndex];
  }

  getRandomByCategory(category) {
    const filtered = this.recipes.filter((recipe) => recipe.category === category);
    if (!filtered.length) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  generateMonthlyPlan(weeks = 4) {
    const mealPool = this.recipes.filter((recipe) => recipe.category === 'meal');
    if (!mealPool.length) {
      return { weeks: [], warning: 'Bitte mindestens eine Mahlzeit anlegen.' };
    }

    const breakfastPool = this.recipes.filter(
      (recipe) => recipe.category === 'meal' && (recipe.mealSlot === 'breakfast' || recipe.mealSlot === 'all')
    );
    const lunchPool = this.recipes.filter(
      (recipe) => recipe.category === 'meal' && (recipe.mealSlot === 'lunch' || recipe.mealSlot === 'all')
    );
    const breakfastSource = breakfastPool.length ? breakfastPool : mealPool;
    const lunchSource = lunchPool.length ? lunchPool : mealPool;

    const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const totalDays = weeks * dayNames.length;
    const breakfastSequence = this.createNonRepeatingSequence(breakfastSource, totalDays);
    const lunchSequence = this.createNonRepeatingSequence(lunchSource, totalDays * 2);
    const monthlyWeeks = Array.from({ length: weeks }, (_, weekIndex) => {
      const days = dayNames.map((dayName, dayIndex) => {
        const absoluteDayIndex = weekIndex * dayNames.length + dayIndex;
        const lunchStartIndex = absoluteDayIndex * 2;
        return {
          day: dayName,
          breakfast: breakfastSequence[absoluteDayIndex] || null,
          lunches: [lunchSequence[lunchStartIndex], lunchSequence[lunchStartIndex + 1]].filter(Boolean)
        };
      });
      return {
        label: `Woche ${weekIndex + 1}`,
        days
      };
    });

    const warnings = [];
    if (!breakfastPool.length) warnings.push('Keine Frühstücks-Slots gefunden, allgemeine Mahlzeiten wurden als Frühstück genutzt.');
    if (!lunchPool.length) warnings.push('Keine Mittagessen-Slots gefunden, allgemeine Mahlzeiten wurden als Mittagessen genutzt.');
    if (breakfastSource.length < totalDays) warnings.push(`Zu wenige einzigartige Frühstücke für ${totalDays} Tage, Wiederholungen wurden genutzt.`);
    if (lunchSource.length < totalDays * 2) warnings.push(`Zu wenige einzigartige Mittagessen für ${totalDays * 2} Slots, Wiederholungen wurden genutzt.`);
    const warning = warnings.join(' ');

    return { weeks: monthlyWeeks, warning };
  }

  createNonRepeatingSequence(pool, totalCount) {
    if (!pool.length || totalCount <= 0) return [];
    let batch = [...pool].sort(() => Math.random() - 0.5);
    let batchIndex = 0;
    const sequence = [];

    for (let i = 0; i < totalCount; i += 1) {
      if (batchIndex >= batch.length) {
        batch = [...pool].sort(() => Math.random() - 0.5);
        batchIndex = 0;
      }
      sequence.push(batch[batchIndex]);
      batchIndex += 1;
    }

    return sequence;
  }

  exportRecipes() {
    return this.repository.exportRecipes(this.recipes);
  }

  importRecipes(fileText) {
    const imported = this.repository.importRecipes(fileText);
    this.recipes = imported;
    this.repository.saveRecipes(this.recipes);
    return this.list();
  }
}
