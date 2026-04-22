import { Recipe } from '../models/recipe.js';
import { defaultRecipes } from '../data/defaultRecipes.js';

const STORAGE_KEY = 'recipePlanner.recipes';

export class RecipeRepository {
  loadRecipes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveRecipes(defaultRecipes);
      return [...defaultRecipes];
    }

    try {
      const parsed = JSON.parse(raw);
      return parsed.map((entry) => new Recipe(entry));
    } catch {
      this.saveRecipes(defaultRecipes);
      return [...defaultRecipes];
    }
  }

  saveRecipes(recipes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes, null, 2));
  }

  exportRecipes(recipes) {
    return JSON.stringify(recipes, null, 2);
  }

  importRecipes(fileText) {
    const parsed = JSON.parse(fileText);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON must contain an array of recipes.');
    }

    return parsed.map((entry) => this.validateRecipe(entry));
  }

  validateRecipe(entry) {
    const required = ['name', 'ingredients', 'kcal', 'protein', 'carbs', 'fats', 'cookingTime', 'category', 'mealSlot'];
    const missing = required.filter((key) => entry[key] === undefined || entry[key] === null);
    if (missing.length) {
      throw new Error(`Missing recipe fields: ${missing.join(', ')}`);
    }

    return new Recipe({
      id: entry.id || crypto.randomUUID(),
      name: String(entry.name),
      ingredients: Array.isArray(entry.ingredients)
        ? entry.ingredients.map((i) => String(i).trim()).filter(Boolean)
        : String(entry.ingredients).split(',').map((i) => i.trim()).filter(Boolean),
      kcal: Number(entry.kcal),
      protein: Number(entry.protein),
      carbs: Number(entry.carbs),
      fats: Number(entry.fats),
      cookingTime: Number(entry.cookingTime),
      category: entry.category === 'snack' ? 'snack' : 'meal',
      mealSlot: ['breakfast', 'lunch', 'all'].includes(entry.mealSlot) ? entry.mealSlot : 'all'
    });
  }
}
