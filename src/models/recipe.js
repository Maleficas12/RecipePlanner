export class Recipe {
  constructor({
    id,
    name,
    ingredients,
    kcal,
    protein,
    carbs,
    fats,
    cookingTime,
    category,
    mealSlot
  }) {
    this.id = id;
    this.name = name;
    this.ingredients = ingredients;
    this.kcal = kcal;
    this.protein = protein;
    this.carbs = carbs;
    this.fats = fats;
    this.cookingTime = cookingTime;
    this.category = category;
    this.mealSlot = mealSlot;
  }
}
