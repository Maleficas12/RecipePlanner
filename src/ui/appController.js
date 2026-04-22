import { downloadText } from '../utils/dom.js';

export class AppController {
  constructor({ service, renderer, elements }) {
    this.service = service;
    this.renderer = renderer;
    this.elements = elements;
  }

  init() {
    this.registerEvents();
    this.render();
    this.renderer.renderPlanner(this.elements.plannerContainer, this.service.generateWeeklyPlan());
    this.applySavedTheme();
  }

  registerEvents() {
    const {
      recipeForm,
      cancelEditBtn,
      pickRandomBtn,
      generatePlannerBtn,
      exportJsonBtn,
      importJsonInput,
      themeToggle
    } = this.elements;

    recipeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = this.readFormPayload();
      this.service.upsert(payload);
      this.render();
      this.resetForm();
    });

    cancelEditBtn.addEventListener('click', () => this.resetForm());

    pickRandomBtn.addEventListener('click', () => {
      const recipe = this.service.getRandom();
      this.renderer.renderRandomRecipe(this.elements.randomResult, recipe);
    });

    generatePlannerBtn.addEventListener('click', () => {
      this.renderer.renderPlanner(this.elements.plannerContainer, this.service.generateWeeklyPlan());
    });

    exportJsonBtn.addEventListener('click', () => {
      const json = this.service.exportRecipes();
      downloadText('recipe-planner-recipes.json', json);
    });

    importJsonInput.addEventListener('change', async (event) => {
      const [file] = event.target.files;
      if (!file) return;

      try {
        const text = await file.text();
        this.service.importRecipes(text);
        this.render();
        this.resetForm();
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    });

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('recipePlanner.theme', next);
    });
  }

  render() {
    const recipes = this.service.list();
    this.renderer.renderRecipes(recipes, {
      onEdit: (recipe) => this.populateForm(recipe),
      onRemove: (recipe) => {
        this.service.remove(recipe.id);
        this.render();
      }
    });
  }

  readFormPayload() {
    const { form } = this.elements;
    const formData = new FormData(form);

    return {
      id: formData.get('recipeId') || crypto.randomUUID(),
      name: formData.get('name')?.trim(),
      ingredients: String(formData.get('ingredients') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      kcal: Number(formData.get('kcal')),
      protein: Number(formData.get('protein')),
      carbs: Number(formData.get('carbs')),
      fats: Number(formData.get('fats')),
      cookingTime: Number(formData.get('cookingTime')),
      category: formData.get('category'),
      mealSlot: formData.get('mealSlot')
    };
  }

  populateForm(recipe) {
    const { formTitle, cancelEditBtn, form } = this.elements;

    formTitle.textContent = 'Edit Recipe';
    cancelEditBtn.hidden = false;

    form.recipeId.value = recipe.id;
    form.name.value = recipe.name;
    form.ingredients.value = recipe.ingredients.join(', ');
    form.kcal.value = recipe.kcal;
    form.protein.value = recipe.protein;
    form.carbs.value = recipe.carbs;
    form.fats.value = recipe.fats;
    form.cookingTime.value = recipe.cookingTime;
    form.category.value = recipe.category;
    form.mealSlot.value = recipe.mealSlot;
  }

  resetForm() {
    const { formTitle, cancelEditBtn, form } = this.elements;
    formTitle.textContent = 'Add Recipe';
    cancelEditBtn.hidden = true;
    form.reset();
    form.recipeId.value = '';
    form.category.value = 'meal';
    form.mealSlot.value = 'all';
  }

  applySavedTheme() {
    const saved = localStorage.getItem('recipePlanner.theme') || 'light';
    document.documentElement.dataset.theme = saved;
  }
}
