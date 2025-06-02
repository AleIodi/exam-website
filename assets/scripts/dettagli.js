const API_BASE_URL = 'https://dummyjson.com/recipes';
const API_PARAMS = '?limit=100&select=id,cuisine,name,mealType&sortBy=name&order=asc';

document.addEventListener('DOMContentLoaded', () => {
    loadRecipeDetails();
    loadCommonData();
});

function toggleLoadingState(isLoading, errorMessage = null) {
    const container = document.getElementById('main');
    if (!container) return null;

    container.querySelectorAll('.loading-indicator, .error-message, .recipe-content-wrapper').forEach(el => el.remove());

    if (isLoading) {
        const loader = createElement('div', 'loading-indicator', '<span class="icon-spin" aria-hidden="true" style="margin-right: 8px;"></span>Loading recipes...');
        container.appendChild(loader);
        return loader;
    } else if (errorMessage) {
        const errorEl = createElement('div', 'error-message');
        errorEl.innerHTML = `
            <p>Error loading recipes: ${errorMessage}.</p>
            <p>Please try again later or <button class="retry-button">try again now</button>.</p>
        `;
        errorEl.querySelector('.retry-button').addEventListener('click', loadRecipeDetails);
        container.appendChild(errorEl);
    }
    return null;
}

async function loadRecipeDetails() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) return;

    toggleLoadingState(true);

    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('recipeId');

    if (!recipeId) {
        toggleLoadingState(false, "No recipe ID provided.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/${recipeId}`);
        if (!res.ok) {
            if (res.status === 404) throw new Error(`Recipe not found (ID: ${recipeId})`);
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const recipe = await res.json();

        toggleLoadingState(false);
        displayRecipeDetails(recipe, mainContainer);
        generateRecipeSchema(recipe);

        document.title = `${recipe.name || 'Recipe'} - Delicious Recipes`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = `Learn how to make ${recipe.name || 'this delicious recipe'}. Ingredients, instructions, and tips for this ${recipe.cuisine || ''} dish.`;
        }

    } catch (error) {
        console.error('Error loading recipe details:', error);
        toggleLoadingState(false, error.message);
    }
}

async function loadCommonData() {
    try {
        const res = await fetch(API_BASE_URL + API_PARAMS);
        if (!res.ok) throw new Error(`HTTP error for common data! Status: ${res.status}`);

        const data = await res.json();
        if (!data.recipes || !data.recipes.length) throw new Error('No recipes found for common data');

        const uniqueCuisines = [...new Set(data.recipes.map(recipe => recipe.cuisine || 'Other'))].filter(Boolean).sort();
        populateSidebarCuisines(uniqueCuisines);

        const allMealTypes = [...new Set(data.recipes.flatMap(recipe =>
            Array.isArray(recipe.mealType) ? recipe.mealType : []
        ).filter(Boolean))].sort();
        populateFooterMealTypes(allMealTypes);

    } catch (error) {
        console.error('Error loading common data for sidebar/footer:', error);
    }
}

function formatTime(minutes) {
    if (isNaN(minutes) || minutes === null || minutes < 0) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let timeString = '';
    if (h > 0) timeString += `${h} h`;
    if (m > 0 || h === 0) timeString += `${m} min`;
    return timeString.trim() || '0 min';
}

function createDetailTagLinksHTML(items, queryParam, itemClass = 'tag') {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.filter(Boolean).map(item =>
        `<a href="risultati.html?${queryParam}=${encodeURIComponent(item)}"
           title="View all ${item} recipes"
           class="${itemClass}${queryParam === 'mealType' ? ' meal-type' : ''}">${item}</a>`
    ).join('');
}

function displayRecipeDetails(recipe, mainContainer) {
    const recipeContentWrapper = createElement('div', 'recipe-content-wrapper');
    const placeholderImage = 'assets/images/placeholder.jpg';

    const cuisineName = recipe.cuisine || 'Category';
    const recipeName = recipe.name || 'Recipe';

    const breadcrumbContainer = createElement('nav', 'breadcrumb-container');
    breadcrumbContainer.setAttribute('aria-label', 'breadcrumb');
    breadcrumbContainer.innerHTML = `
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="risultati.html?cuisine=${encodeURIComponent(cuisineName)}">${cuisineName}</a></li>
            <li><span aria-current="page">${recipeName}</span></li>
        </ul>
    `;
    recipeContentWrapper.appendChild(breadcrumbContainer);

    const article = createElement('article', 'recipe-content-detail');

    // colonna sinistra
    const leftColumn = createElement('div', 'recipe-column-left');
    const stickyGroup = createElement('div', 'recipe-left-sticky-group');

    const imageContainer = createElement('div', 'recipe-image-container-detail');
    const image = createElement('img');
    image.src = recipe.image || placeholderImage;
    image.alt = `Image of ${recipeName}`;
    image.onerror = function () { this.onerror = null; this.src = placeholderImage; };
    imageContainer.appendChild(image);
    stickyGroup.appendChild(imageContainer);

    const metaItemsHTML = [
        recipe.prepTimeMinutes !== undefined ? `
        <div class="meta-item">
            <div class="meta-item-header">
                <span class="icon-clock meta-icon"></span>
                <span class="meta-label">PREP TIME:</span>
            </div>
            <span class="meta-value">${formatTime(recipe.prepTimeMinutes)}</span>
        </div>` : '',
        recipe.cookTimeMinutes !== undefined ? `
        <div class="meta-item">
            <div class="meta-item-header">
                <span class="icon-leaf meta-icon"></span>
                <span class="meta-label">COOK TIME:</span>
            </div>
            <span class="meta-value">${formatTime(recipe.cookTimeMinutes)}</span>
        </div>` : '',
        recipe.servings ? `
        <div class="meta-item">
            <div class="meta-item-header">
                <span class="icon-users meta-icon"></span>
                <span class="meta-label">SERVINGS:</span>
            </div>
            <span class="meta-value">${recipe.servings}</span>
        </div>` : '',
        recipe.cuisine ? `
        <div class="meta-item">
            <div class="meta-item-header">
                <span class="icon-pin meta-icon"></span> 
                <span class="meta-label">CUISINE:</span>
            </div>
            <span class="meta-value">${recipe.cuisine}</span>
        </div>` : '',
        recipe.rating !== undefined && recipe.rating !== null ? `
         <div class="meta-item">
            <div class="meta-item-header">
                <span class="icon-star meta-icon"></span>
                <span class="meta-label">RATING:</span>
            </div>
            <span class="meta-value">${recipe.rating.toFixed(1)} (${recipe.reviewCount || 0} reviews)</span>
        </div>` : '',
        recipe.caloriesPerServing ? `
        <div class="meta-item">
            <div class="meta-item-header">
                <span class="icon-flash meta-icon"></span>
                <span class="meta-label">CALORIES:</span>
            </div>
            <span class="meta-value">${recipe.caloriesPerServing} per serving</span>
        </div>` : ''
    ].filter(Boolean).join('').trim();

    if (metaItemsHTML) {
        const detailsTitle = createElement('h3', 'sticky-group-title details-title');
        detailsTitle.textContent = 'Recipe Details';
        stickyGroup.appendChild(detailsTitle);

        const metaInfoGrid = createElement('div', 'recipe-meta-info');
        metaInfoGrid.innerHTML = metaItemsHTML;
        stickyGroup.appendChild(metaInfoGrid);
    }

    leftColumn.appendChild(stickyGroup);
    article.appendChild(leftColumn);

    // colonna destra
    const rightColumn = createElement('div', 'recipe-column-right');

    const titleElement = createElement('h1', 'recipe-title-detail');
    titleElement.textContent = recipeName;
    rightColumn.appendChild(titleElement);

    if (recipe.ingredients && recipe.ingredients.length > 0) {
        const ingredientsSection = createElement('section', 'recipe-ingredients-detail');
        const ingredientsTitle = createElement('h2');
        ingredientsTitle.textContent = 'Ingredients';
        ingredientsSection.appendChild(ingredientsTitle);
        const ul = createElement('ul');
        recipe.ingredients.forEach(ing => {
            const li = createElement('li');
            li.textContent = ing;
            ul.appendChild(li);
        });
        ingredientsSection.appendChild(ul);
        rightColumn.appendChild(ingredientsSection);
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
        const instructionsSection = createElement('section', 'recipe-instructions-detail');
        const instructionsTitle = createElement('h2');
        instructionsTitle.textContent = 'Instructions';
        instructionsSection.appendChild(instructionsTitle);
        const ol = createElement('ol');
        recipe.instructions.forEach(step => {
            const li = createElement('li');
            li.textContent = step;
            ol.appendChild(li);
        });
        instructionsSection.appendChild(ol);
        rightColumn.appendChild(instructionsSection);
    }
    article.appendChild(rightColumn);

    // tags
    let tagsSectionTitleElement, detailTagsContainerElement;
    let hasTagsContent = false;

    const tempDetailTagsContainer = createElement('div', 'meta-tags recipe-detail-page-tags');
    if (recipe.difficulty) {
        const difficultySpan = createElement('span', `difficulty difficulty-${recipe.difficulty.toLowerCase()}`);
        difficultySpan.textContent = recipe.difficulty;
        tempDetailTagsContainer.appendChild(difficultySpan);
        hasTagsContent = true;
    }
    const mealTypeHTML = createDetailTagLinksHTML(recipe.mealType, 'mealType');
    if (mealTypeHTML) {
        tempDetailTagsContainer.innerHTML += mealTypeHTML;
        hasTagsContent = true;
    }
    const tagsHTML = createDetailTagLinksHTML(recipe.tags, 'tag');
    if (tagsHTML) {
        tempDetailTagsContainer.innerHTML += tagsHTML;
        hasTagsContent = true;
    }

    if (hasTagsContent) {
        // tags per desktop
        tagsSectionTitleElement = createElement('h3', 'sticky-group-title tags-title original-tags-title');
        tagsSectionTitleElement.textContent = 'Tags & Categories';
        detailTagsContainerElement = tempDetailTagsContainer.cloneNode(true);
        detailTagsContainerElement.classList.add('original-detail-tags');

        stickyGroup.appendChild(tagsSectionTitleElement);
        stickyGroup.appendChild(detailTagsContainerElement);

        // tags per mobile che andranno in fondo alla pagina
        const tagsSectionTitleMobile = createElement('h3', 'sticky-group-title tags-title mobile-tags-title');
        tagsSectionTitleMobile.textContent = 'Tags & Categories';
        const detailTagsContainerMobile = tempDetailTagsContainer.cloneNode(true);
        detailTagsContainerMobile.classList.add('mobile-detail-tags');

        article.appendChild(tagsSectionTitleMobile);
        article.appendChild(detailTagsContainerMobile);
    }

    recipeContentWrapper.appendChild(article);
    mainContainer.appendChild(recipeContentWrapper);
}

// Funzione per durata schema.org
function formatToISODuration(minutes) {
    if (isNaN(minutes) || minutes === null || minutes < 0) {
        return undefined;
    }
    if (minutes === 0) {
        return 'PT0M';
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let duration = 'PT';
    if (h > 0) {
        duration += `${h}H`;
    }
    if (m > 0) {
        duration += `${m}M`;
    }
    return duration;
}

// Funzione per creare lo schema.org
function generateRecipeSchema(recipe) {
    const placeholderImageSrc = 'assets/images/placeholder.jpg';
    const placeholderImageFullUrl = new URL(placeholderImageSrc, window.location.href).href;

    const schema = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.name || "Delicious Recipe",
        "image": recipe.image || placeholderImageFullUrl,
        "description": `Learn how to make ${recipe.name || 'this delicious recipe'}. Ingredients, instructions, and tips for this ${recipe.cuisine || ''} dish.`,
        "keywords": (recipe.tags && recipe.tags.length > 0) ? recipe.tags.join(', ') : undefined,
        "author": {
            "@type": "Organization",
            "name": "Delicious Recipes"
        },
        "prepTime": formatToISODuration(recipe.prepTimeMinutes),
        "cookTime": formatToISODuration(recipe.cookTimeMinutes),
        "totalTime": (recipe.prepTimeMinutes !== undefined && recipe.cookTimeMinutes !== undefined) ? formatToISODuration(recipe.prepTimeMinutes + recipe.cookTimeMinutes) : undefined,
        "recipeYield": recipe.servings ? `${recipe.servings} servings` : undefined,
        "recipeCuisine": recipe.cuisine || undefined,
        "recipeCategory": (recipe.mealType && recipe.mealType.length > 0) ? recipe.mealType.join(', ') : undefined,
        "nutrition": recipe.caloriesPerServing ? {
            "@type": "NutritionInformation",
            "calories": `${recipe.caloriesPerServing} calories per serving`
        } : undefined,
        "recipeIngredient": recipe.ingredients || [],
        "recipeInstructions": recipe.instructions ? recipe.instructions.map(step => ({
            "@type": "HowToStep",
            "text": step
        })) : [],
        "aggregateRating": (recipe.rating !== undefined && recipe.rating !== null && recipe.reviewCount !== undefined) ? {
            "@type": "AggregateRating",
            "ratingValue": recipe.rating,
            "reviewCount": recipe.reviewCount
        } : undefined,
        "url": window.location.href
    };

    const existingSchemaScript = document.getElementById('recipe-schema-ldjson');
    if (existingSchemaScript) {
        existingSchemaScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'recipe-schema-ldjson';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}