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
    const mealPool = this.recipes.filter((recipe) => recipe.category === 'meal');
    if (mealPool.length < 2) {
      return { days: [], warning: 'Please add at least 2 meals.' };
    }

    const shuffled = [...mealPool].sort(() => Math.random() - 0.5);
    const needed = 14;
    const selected = [];

    while (selected.length < needed) {
      const next = shuffled[selected.length % shuffled.length];
      selected.push(next);
      if (shuffled.length >= needed && selected.length >= needed) break;
      if (shuffled.length < needed && selected.length === needed) break;
    }

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = dayNames.map((day, index) => ({
      day,
      meals: [selected[index * 2], selected[index * 2 + 1]].filter(Boolean)
    }));

    const warning = mealPool.length < 14
      ? 'Not enough unique meals for 14 slots. Some meals are repeated.'
      : '';

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
