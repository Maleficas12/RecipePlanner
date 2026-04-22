import { RecipeRepository } from './repository/recipeRepository.js';
import { RecipeService } from './services/recipeService.js';
import { RecipeRenderer } from './ui/recipeRenderer.js';
import { AppController } from './ui/appController.js';
import { byId } from './utils/dom.js';

const repository = new RecipeRepository();
const service = new RecipeService(repository);
const renderer = new RecipeRenderer({
  recipesContainer: byId('recipesContainer'),
  recipeTemplate: byId('recipeItemTemplate')
});

const controller = new AppController({
  service,
  renderer,
  elements: {
    form: byId('recipeForm'),
    recipeForm: byId('recipeForm'),
    recipeId: byId('recipeId'),
    formTitle: byId('formTitle'),
    recipeFormDetails: byId('recipeFormDetails'),
    recipeFormSummary: byId('recipeFormSummary'),
    cancelEditBtn: byId('cancelEditBtn'),
    randomResult: byId('randomResult'),
    pickRandomSnackBtn: byId('pickRandomSnackBtn'),
    pickRandomMealBtn: byId('pickRandomMealBtn'),
    plannerContainer: byId('plannerContainer'),
    generatePlannerBtn: byId('generatePlannerBtn'),
    sharePlannerBtn: byId('sharePlannerBtn'),
    printPlannerBtn: byId('printPlannerBtn'),
    plannerWeekTabs: byId('plannerWeekTabs'),
    plannerWeekTabButtons: Array.from(document.querySelectorAll('#plannerWeekTabs [data-week-index]')),
    randomShoppingListContainer: byId('randomShoppingListContainer'),
    weeklyShoppingListContainer: byId('weeklyShoppingListContainer'),
    exportJsonBtn: byId('exportJsonBtn'),
    importJsonInput: byId('importJsonInput'),
    themeToggle: byId('themeToggle'),
    tabButtons: Array.from(document.querySelectorAll('[data-tab-target]')),
    tabPanels: Array.from(document.querySelectorAll('.tab-panel'))
  }
});

controller.init();
