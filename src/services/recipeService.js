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

  generateWeeklyPlan() {
    const breakfastPool = this.recipes.filter(
      (recipe) => recipe.category === 'meal' && (recipe.mealSlot === 'breakfast' || recipe.mealSlot === 'all')
    );
    const lunchPool = this.recipes.filter(
      (recipe) => recipe.category === 'meal' && (recipe.mealSlot === 'lunch' || recipe.mealSlot === 'all')
    );

    if (!breakfastPool.length || lunchPool.length < 2) {
      return { days: [], warning: 'Bitte mindestens 1 Frühstück und 2 Mittagessen als Mahlzeit anlegen.' };
    }

    const shuffledBreakfasts = [...breakfastPool].sort(() => Math.random() - 0.5);
    const shuffledLunches = [...lunchPool].sort(() => Math.random() - 0.5);
    const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const days = dayNames.map((day, index) => ({
      day,
      breakfast: shuffledBreakfasts[index % shuffledBreakfasts.length],
      lunches: [
        shuffledLunches[(index * 2) % shuffledLunches.length],
        shuffledLunches[(index * 2 + 1) % shuffledLunches.length]
      ]
    }));

    const warnings = [];
    if (breakfastPool.length < 7) warnings.push('Zu wenige einzigartige Frühstücke für 7 Tage, Wiederholungen wurden genutzt.');
    if (lunchPool.length < 14) warnings.push('Zu wenige einzigartige Mittagessen für 14 Slots, Wiederholungen wurden genutzt.');
    const warning = warnings.join(' ');

    return { days, warning };
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
