import { downloadText } from '../utils/dom.js';

export class AppController {
  constructor({ service, renderer, elements }) {
    this.service = service;
    this.renderer = renderer;
    this.elements = elements;
    this.lastRandomSnack = null;
    this.lastRandomMeal = null;
    this.lastPlanner = { weeks: [], warning: '' };
    this.activePlannerWeekIndex = 0;
    this.checkedRandomShoppingItems = new Set();
    this.checkedWeeklyShoppingItems = new Set();
  }

  init() {
    this.registerEvents();
    this.render();
    this.lastPlanner = this.service.generateMonthlyPlan();
    this.renderer.renderPlanner(this.elements.plannerContainer, this.lastPlanner, this.activePlannerWeekIndex);
    this.updatePlannerWeekTabs();
    this.renderRandomSummary();
    this.renderShoppingList();
    this.applySavedTheme();
  }

  registerEvents() {
    const {
      recipeForm,
      cancelEditBtn,
      pickRandomSnackBtn,
      pickRandomMealBtn,
      generatePlannerBtn,
      printPlannerBtn,
      exportJsonBtn,
      importJsonInput,
      themeToggle,
      tabButtons,
      plannerWeekTabButtons
    } = this.elements;

    recipeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = this.readFormPayload();
      this.service.upsert(payload);
      this.render();
      this.resetForm();
    });

    cancelEditBtn.addEventListener('click', () => this.resetForm());

    pickRandomSnackBtn.addEventListener('click', () => {
      this.lastRandomSnack = this.service.getRandomByCategory('snack');
      this.renderRandomSummary();
      this.renderShoppingList();
    });

    pickRandomMealBtn.addEventListener('click', () => {
      this.lastRandomMeal = this.service.getRandomByCategory('meal');
      this.renderRandomSummary();
      this.renderShoppingList();
    });

    generatePlannerBtn.addEventListener('click', () => {
      this.lastPlanner = this.service.generateMonthlyPlan();
      this.activePlannerWeekIndex = 0;
      this.renderer.renderPlanner(this.elements.plannerContainer, this.lastPlanner, this.activePlannerWeekIndex);
      this.updatePlannerWeekTabs();
      this.renderShoppingList();
    });

    printPlannerBtn.addEventListener('click', () => {
      window.print();
    });

    plannerWeekTabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.activePlannerWeekIndex = Number(button.dataset.weekIndex || 0);
        this.renderer.renderPlanner(this.elements.plannerContainer, this.lastPlanner, this.activePlannerWeekIndex);
        this.updatePlannerWeekTabs();
        this.renderShoppingList();
      });
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
        alert(`Import fehlgeschlagen: ${error.message}`);
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

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.activateTab(button.dataset.tabTarget);
      });
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
    this.renderShoppingList();
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
    const { formTitle, cancelEditBtn, form, recipeFormDetails, recipeFormSummary } = this.elements;

    formTitle.textContent = 'Rezept bearbeiten';
    recipeFormSummary.textContent = 'Rezept bearbeiten';
    recipeFormDetails.open = true;
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
    const { formTitle, cancelEditBtn, form, recipeFormSummary } = this.elements;
    formTitle.textContent = 'Rezept hinzufügen';
    recipeFormSummary.textContent = 'Rezept hinzufügen';
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

  renderRandomSummary() {
    if (!this.lastRandomSnack && !this.lastRandomMeal) {
      this.elements.randomResult.textContent = 'Noch nichts ausgewählt.';
      return;
    }

    const sections = [];
    if (this.lastRandomSnack) {
      sections.push(`
        <div>
          <strong>Snack: ${this.lastRandomSnack.name}</strong><br />
          <span class="muted">Zutaten: ${this.lastRandomSnack.ingredients.join(', ') || '-'}</span>
        </div>
      `);
    }
    if (this.lastRandomMeal) {
      sections.push(`
        <div>
          <strong>Mahlzeit: ${this.lastRandomMeal.name}</strong><br />
          <span class="muted">Zutaten: ${this.lastRandomMeal.ingredients.join(', ') || '-'}</span>
        </div>
      `);
    }

    this.elements.randomResult.innerHTML = sections.join('<hr />');
  }

  renderShoppingList() {
    const randomIngredients = this.collectRandomShoppingIngredients();
    const weeklyIngredients = this.collectWeeklyShoppingIngredients();

    const activeRandomNames = new Set(randomIngredients.map((entry) => entry.name));
    this.checkedRandomShoppingItems.forEach((name) => {
      if (!activeRandomNames.has(name)) this.checkedRandomShoppingItems.delete(name);
    });
    const activeWeeklyNames = new Set(weeklyIngredients.map((entry) => entry.name));
    this.checkedWeeklyShoppingItems.forEach((name) => {
      if (!activeWeeklyNames.has(name)) this.checkedWeeklyShoppingItems.delete(name);
    });

    this.renderer.renderShoppingList(
      this.elements.randomShoppingListContainer,
      randomIngredients,
      this.checkedRandomShoppingItems,
      {
        onToggle: (name, isChecked) => {
          if (isChecked) this.checkedRandomShoppingItems.add(name);
          else this.checkedRandomShoppingItems.delete(name);
        }
      }
    );

    this.renderer.renderShoppingList(
      this.elements.weeklyShoppingListContainer,
      weeklyIngredients,
      this.checkedWeeklyShoppingItems,
      {
        onToggle: (name, isChecked) => {
          if (isChecked) this.checkedWeeklyShoppingItems.add(name);
          else this.checkedWeeklyShoppingItems.delete(name);
        }
      }
    );
  }

  collectRandomShoppingIngredients() {
    const sourceRecipes = [
      this.lastRandomSnack,
      this.lastRandomMeal
    ].filter(Boolean);

    return this.aggregateIngredients(sourceRecipes);
  }

  collectWeeklyShoppingIngredients() {
    const activeWeek = this.lastPlanner.weeks[this.activePlannerWeekIndex];
    if (!activeWeek) return [];
    const sourceRecipes = activeWeek.days.flatMap((day) => [day.breakfast, ...day.lunches]).filter(Boolean);
    return this.aggregateIngredients(sourceRecipes);
  }

  aggregateIngredients(sourceRecipes) {
    const counts = new Map();
    sourceRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const key = ingredient.trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  activateTab(tabId) {
    this.elements.tabButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.tabTarget === tabId);
    });
    this.elements.tabPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === tabId);
    });
  }

  updatePlannerWeekTabs() {
    this.elements.plannerWeekTabButtons.forEach((button) => {
      const weekIndex = Number(button.dataset.weekIndex || 0);
      const isActive = weekIndex === this.activePlannerWeekIndex;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
  }
}
