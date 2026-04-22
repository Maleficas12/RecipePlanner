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
    cancelEditBtn: byId('cancelEditBtn'),
    randomResult: byId('randomResult'),
    pickRandomBtn: byId('pickRandomBtn'),
    plannerContainer: byId('plannerContainer'),
    generatePlannerBtn: byId('generatePlannerBtn'),
    exportJsonBtn: byId('exportJsonBtn'),
    importJsonInput: byId('importJsonInput'),
    themeToggle: byId('themeToggle')
  }
});

controller.init();
