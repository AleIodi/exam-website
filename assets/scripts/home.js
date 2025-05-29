const API_BASE_URL = 'https://dummyjson.com/recipes';
const API_PARAMS = '?limit=100&select=id,cuisine,name,image,rating,reviewCount,tags,difficulty,mealType&sortBy=rating&order=desc';

document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
});

function toggleLoadingState(isLoading, errorMessage = null) {
    const container = document.getElementById('main');
    if (!container) return null;

    container.querySelectorAll('.loading-indicator, .error-message, .section-ricette, .view-all-recipes-container').forEach(el => el.remove());

    if (isLoading) {
        const loader = createElement('div', 'loading-indicator', 'Loading recipes...');
        container.appendChild(loader);
        return loader;
    } else if (errorMessage) {
        const errorEl = createElement('div', 'error-message');
        errorEl.innerHTML = `
            <p>Error loading recipes: ${errorMessage}.</p>
            <p>Please try again later or <button class="retry-button">try again now</button>.</p>
        `;
        errorEl.querySelector('.retry-button').addEventListener('click', loadRecipes);
        container.appendChild(errorEl);
    }
    return null;
}

async function loadRecipes() {
    toggleLoadingState(true);
    try {
        const res = await fetch(API_BASE_URL + API_PARAMS);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        if (!data.recipes || !data.recipes.length) throw new Error('No recipes found');

        toggleLoadingState(false);
        displayRecipes(data.recipes);

        const uniqueCuisines = [...new Set(data.recipes.map(recipe => recipe.cuisine || 'Other'))].sort();
        populateSidebarCuisines(uniqueCuisines);

        const allMealTypes = [...new Set(data.recipes.flatMap(recipe =>
            Array.isArray(recipe.mealType) ? recipe.mealType : []
        ).filter(Boolean))];
        populateFooterMealTypes(allMealTypes);

    } catch (error) {
        console.error('Error loading recipes:', error);
        toggleLoadingState(false, error.message);
    }
}

function getRandomItems(array, count) {
    if (!Array.isArray(array) || array.length === 0) return [];
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function displayRecipes(recipes) {
    if (!Array.isArray(recipes) || !recipes.length) {
        toggleLoadingState(false, 'No recipes available');
        return;
    }

    const mainContainer = document.getElementById('main');
    if (!mainContainer) {
        console.error('Main container not found');
        return;
    }

    try {
        displayRecipeSection('Popular Recipes', 'popular', recipes.slice(0, 3), mainContainer);

        const italianRecipes = recipes.filter(r => r.cuisine.toLowerCase() === 'italian');
        displayRecipeSection('Italian Cuisine', 'Italian', getRandomItems(italianRecipes, 3), mainContainer);

        const nonItalianRecipes = recipes.filter(r => r.cuisine.toLowerCase() !== 'italian' && r.cuisine);
        displayRecipeSection('International Cuisines', 'International', getRandomItems(nonItalianRecipes, 3), mainContainer);

        appendViewAllButton(mainContainer);
    } catch (error) {
        console.error('Error displaying recipes:', error);
        toggleLoadingState(false, `Error displaying recipes: ${error.message}`);
    }
}

function displayRecipeSection(title, typeParam, recipeList, container) {
    if (!container || !Array.isArray(recipeList) || recipeList.length === 0) return;

    const lowerTypeParam = typeParam.toLowerCase();
    let titleUrl;
    if (lowerTypeParam === 'popular') titleUrl = `risultati.html?type=popular`;
    else if (lowerTypeParam === 'international') titleUrl = `risultati.html?cuisine=!Italian`;
    else titleUrl = `risultati.html?cuisine=${encodeURIComponent(typeParam)}`;
    const titleAltText = `View all ${title} recipes`;

    const section = createElement('section', 'section-ricette');
    section.innerHTML = `
        <div class="titolo-section">
            <div class="title-group"><a href="${titleUrl}" title="${titleAltText}"><h3>${title}</h3></a></div>
            <div class="link-group">
                <a href="${titleUrl}" title="${titleAltText}" class="btn-view-all-header">
                    View all <span class="icon-down"></span>
                </a>
            </div>
        </div>
    `;
    const grid = createElement('div', 'contenuto-section-grid');
    recipeList.forEach(recipe => {
        if (recipe) grid.appendChild(createRecipeCard(recipe));
    });
    section.appendChild(grid);
    container.appendChild(section);
}

function createRecipeCard(recipe) {
    if (!recipe.name || !recipe.id) {
        console.warn("Insufficient recipe data", recipe);
        return createElement('article');
    }
    const article = createElement('article');
    const createTagLinks = (items, queryParam, itemClass = 'tag') => {
        if (!Array.isArray(items)) return '';
        return items.filter(Boolean).map(item =>
            `<a href="risultati.html?${queryParam}=${encodeURIComponent(item)}"
               title="View all ${item} recipes"
               class="${itemClass}${queryParam === 'mealType' ? ' meal-type' : ''}">${item}</a>`
        ).join('');
    };
    const mealTypeTags = createTagLinks(recipe.mealType, 'mealType');
    const regularTags = createTagLinks(recipe.tags, 'tag');
    const image = recipe.image || 'assets/images/placeholder.jpg';

    article.innerHTML = `
        <a href="dettagli.html?recipeId=${recipe.id}" title="Details of ${recipe.name}">
            <img src="${image}" alt="Photo of ${recipe.name}" loading="lazy" 
                 onerror="this.onerror=null; this.src='assets/images/placeholder.jpg';">
            <div class="card-content">
                <h4 class="titolo-card">${recipe.name}</h4>
                <div class="rating-review">
                    <span class="icon-star"></span>${recipe.rating?.toFixed(1) || 'N/A'}
                    <span class="icon-comment"></span>${recipe.reviewCount || '0'}
                </div>
                <div class="meta-tags">
                    ${recipe.difficulty ? `<span class="difficulty difficulty-${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span>` : ''}
                    ${mealTypeTags}
                    ${regularTags}
                </div>
            </div>
        </a>
    `;
    return article;
}

function appendViewAllButton(container) {
    if (!container) return;
    const buttonContainer = createElement('div', 'view-all-recipes-container');
    const button = createElement('a', 'btn-view-all', 'View All Recipes');
    button.href = 'risultati.html';
    button.title = 'Discover all our delicious recipes';
    buttonContainer.appendChild(button);
    container.appendChild(buttonContainer);
}