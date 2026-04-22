export class RecipeRenderer {
  constructor({ recipesContainer, recipeTemplate }) {
    this.recipesContainer = recipesContainer;
    this.recipeTemplate = recipeTemplate;
  }

  renderRecipes(recipes, { onEdit, onRemove }) {
    this.recipesContainer.innerHTML = '';

    if (!recipes.length) {
      this.recipesContainer.innerHTML = '<p class="muted">Noch keine Rezepte vorhanden.</p>';
      return;
    }

    for (const recipe of recipes) {
      const fragment = this.recipeTemplate.content.cloneNode(true);
      fragment.querySelector('[data-role="name"]').textContent = recipe.name;
      const categoryLabel = recipe.category === 'snack' ? 'Snack' : 'Mahlzeit';
      const slotMap = { breakfast: 'Frühstück', lunch: 'Mittagessen', all: 'Alle' };
      fragment.querySelector('[data-role="tags"]').textContent = `${categoryLabel} · ${slotMap[recipe.mealSlot] || recipe.mealSlot}`;
      fragment.querySelector('[data-role="ingredients"]').textContent = `Zutaten: ${recipe.ingredients.join(', ')}`;
      fragment.querySelector('[data-role="kcal"]').textContent = recipe.kcal;
      fragment.querySelector('[data-role="protein"]').textContent = `${recipe.protein}g`;
      fragment.querySelector('[data-role="carbs"]').textContent = `${recipe.carbs}g`;
      fragment.querySelector('[data-role="fats"]').textContent = `${recipe.fats}g`;
      fragment.querySelector('[data-role="time"]').textContent = `${recipe.cookingTime} Min`;
      fragment.querySelector('[data-role="edit"]').addEventListener('click', () => onEdit(recipe));
      fragment.querySelector('[data-role="remove"]').addEventListener('click', () => onRemove(recipe));
      this.recipesContainer.appendChild(fragment);
    }
  }

  renderRandomRecipe(container, recipe, label = 'Gericht') {
    if (!recipe) {
      container.textContent = 'Keine passenden Rezepte verfügbar.';
      return;
    }

    container.innerHTML = `
      <strong>${label}: ${recipe.name}</strong><br />
      <span class="muted">${recipe.category} · ${recipe.mealSlot} · ${recipe.kcal} kcal · ${recipe.cookingTime} Min</span>
    `;
  }

  renderPlanner(container, planner, activeWeekIndex = 0) {
    if (!planner.weeks?.length) {
      container.innerHTML = `<p class="muted">${planner.warning || 'Keine Daten verfügbar.'}</p>`;
      return;
    }

    const week = planner.weeks[activeWeekIndex] || planner.weeks[0];
    const warningHtml = planner.warning ? `<p class="muted">${planner.warning}</p>` : '';
    const mealLine = (meal) => `
      <li>
        <strong>${meal.name}</strong><br />
        <span class="muted">Zutaten: ${meal.ingredients.join(', ') || '-'}</span>
      </li>
    `;
    const daysHtml = week.days.map((day) => `
      <article class="day-card">
        <h4>${day.day}</h4>
        <p><strong>Frühstück:</strong></p>
        <ul>
          ${day.breakfast ? mealLine(day.breakfast) : '<li>-</li>'}
        </ul>
        <p><strong>Mittagessen:</strong></p>
        <ul>
          ${day.lunches.map((meal) => mealLine(meal)).join('')}
        </ul>
      </article>
    `).join('');

    container.innerHTML = `
      ${warningHtml}
      <h3 class="planner-week-title">${week.label}</h3>
      <div class="week-grid">${daysHtml}</div>
    `;
  }

  renderShoppingList(container, ingredientItems, checkedState, { onToggle }) {
    if (!ingredientItems.length) {
      container.innerHTML = '<p class="muted">Noch keine Zutaten vorhanden.</p>';
      return;
    }

    const list = document.createElement('ul');
    ingredientItems.forEach((entry) => {
      const item = document.createElement('li');
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = checkedState.has(entry.name);
      checkbox.addEventListener('change', () => onToggle(entry.name, checkbox.checked));

      const text = document.createElement('span');
      text.textContent = entry.count > 1 ? `${entry.name} x${entry.count}` : entry.name;
      if (checkbox.checked) text.classList.add('is-checked');
      checkbox.addEventListener('change', () => {
        text.classList.toggle('is-checked', checkbox.checked);
      });

      label.append(checkbox, text);
      item.appendChild(label);
      list.appendChild(item);
    });

    container.replaceChildren(list);
  }
}
