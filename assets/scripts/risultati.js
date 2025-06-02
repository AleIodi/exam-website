const API_BASE_URL = 'https://dummyjson.com/recipes';
const API_PARAMS = '?limit=100&select=id,cuisine,name,image,rating,reviewCount,tags,difficulty,mealType&sortBy=rating&order=desc';

document.addEventListener('DOMContentLoaded', () => {
    loadCommonData();
    loadSearchResults();
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
        errorEl.querySelector('.retry-button').addEventListener('click', loadSearchResults);
        container.appendChild(errorEl);
    }
    return null;
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

        const allTags = [...new Set(data.recipes.flatMap(recipe =>
            Array.isArray(recipe.tags) ? recipe.tags : []
        ).filter(Boolean))].sort();

        createFilters(uniqueCuisines, allMealTypes, allTags);

        const urlParams = new URLSearchParams(document.location.search);
        const cuisinesFilter = urlParams.getAll("cuisine");
        const mealTypesFilter = urlParams.getAll("mealType");
        const tagsFilter = urlParams.getAll("tag");
        const ratingFilter = urlParams.get("rating");

        updateFilterUIFromURLParams(cuisinesFilter, mealTypesFilter, tagsFilter, ratingFilter);

    } catch (error) {
        console.error('Error loading common data for sidebar/footer:', error);
    }
}

async function loadSearchResults() {
    const urlParams = new URLSearchParams(document.location.search);

    const searchTerm = urlParams.get("cerca")?.trim() ?? '';
    const cuisinesFilter = urlParams.getAll("cuisine");
    const mealTypesFilter = urlParams.getAll("mealType");
    const tagsFilter = urlParams.getAll("tag");
    const ratingFilter = urlParams.get("rating");
    const popular = urlParams.getAll("type");

    const searchInput = document.getElementById('cerca');
    if (searchInput) searchInput.value = searchTerm;


    let apiQuery;
    if (searchTerm) {
        apiQuery = `/search?q=${encodeURIComponent(searchTerm)}&limit=0`;
    } else {
        apiQuery = API_PARAMS;
    }

    toggleLoadingState(true);

    try {
        const res = await fetch(API_BASE_URL + apiQuery);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        let recipes = data.recipes || [];

        if (recipes.length > 0) {
            if (popular.length > 0) {
                recipes = recipes.filter(recipe => {
                    return recipe.rating && recipe.rating >= 4.5;
                });
            }

            if (cuisinesFilter.length > 0) {
                recipes = recipes.filter(recipe => {
                    return cuisinesFilter.some(filter => {
                        if (filter.startsWith('!')) {
                            const excludeCuisine = filter.substring(1);
                            return recipe.cuisine != excludeCuisine;
                        } else {
                            return recipe.cuisine == filter;
                        }
                    });
                });
            }

            if (mealTypesFilter.length > 0) {
                recipes = recipes.filter(recipe => {
                    return recipe.mealType && recipe.mealType.some(type => mealTypesFilter.includes(type));
                });
            }

            if (tagsFilter.length > 0) {
                recipes = recipes.filter(recipe => {
                    return recipe.tags && recipe.tags.some(tag => tagsFilter.includes(tag));
                });
            }

            if (ratingFilter) {
                const minRating = parseFloat(ratingFilter);
                recipes = recipes.filter(recipe => {
                    return recipe.rating && recipe.rating >= minRating;
                });
            }
        }

        toggleLoadingState(false);

        const mainContent = document.getElementById('main');
        mainContent.querySelectorAll('.section-ricette, .no-recipes').forEach(el => el.remove());

        const resultsTitleEl = document.getElementById('results-title');
        const resultsCountEl = document.getElementById('results-count');

        if (resultsTitleEl) {
            if (searchTerm) {
                resultsTitleEl.textContent = `Results for "${searchTerm}"`;
            } else if (cuisinesFilter.length || mealTypesFilter.length || tagsFilter.length || ratingFilter) {
                resultsTitleEl.textContent = 'Filtered Recipes';
            } else if (popular.length) {
                resultsTitleEl.textContent = 'Popular Recipes';
            } else {
                resultsTitleEl.textContent = 'All Recipes';
            }
        }

        if (!recipes || recipes.length === 0) {
            let noResultsMessage = 'No recipes match your criteria.';
            if (searchTerm) {
                noResultsMessage = `No recipes found for "${searchTerm}"`;
                if (cuisinesFilter.length || mealTypesFilter.length || tagsFilter.length || ratingFilter) {
                    noResultsMessage += " with the selected filters.";
                }
            } else if (cuisinesFilter.length || mealTypesFilter.length || tagsFilter.length || ratingFilter) {
                noResultsMessage = 'No recipes match your selected filters.';
            }
            const noRecipesEl = createElement('div', 'no-recipes', noResultsMessage);
            mainContent.appendChild(noRecipesEl);
            if (resultsCountEl) resultsCountEl.textContent = `(0 recipes)`;
        } else {
            const grid = createElement('div', 'contenuto-section-grid');
            recipes.forEach(rec => grid.appendChild(displayRecipes(rec)));
            const section = createElement('section', 'section-ricette');
            section.appendChild(grid);
            mainContent.appendChild(section);
            if (resultsCountEl) resultsCountEl.textContent = `(${recipes.length} recipes)`;
        }

    } catch (error) {
        console.error('Error loading or filtering search results:', error);
        toggleLoadingState(false, error.message);
        const resultsCountEl = document.getElementById('results-count');
        if (resultsCountEl) resultsCountEl.textContent = `(0 recipes)`;
        const resultsTitleEl = document.getElementById('results-title');
        if (resultsTitleEl) resultsTitleEl.textContent = 'Error Loading Recipes';
    }
}

function displayRecipes(recipe) {
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

function createFilters(cuisines, mealTypes, tags) {
    const cuisineContainer = document.getElementById('cuisine-filters');
    const mealTypeContainer = document.getElementById('meal-type-filters');
    const tagContainer = document.getElementById('tag-filters');
    const ratingContainer = document.getElementById('rating-filters');

    const populateFilterOptions = (container, items, name, type = 'checkbox') => {
        if (!container) return;
        const placeholder = container.querySelector('.filter-placeholder');
        if (placeholder) placeholder.remove();
        container.innerHTML = '';

        items.forEach(item => {
            const value = typeof item === 'object' ? item.value : item;
            const text = typeof item === 'object' ? item.text : item;
            const label = createElement('label');
            const input = createElement('input');
            input.type = type;
            input.name = name;
            input.value = value;
            label.appendChild(input);
            label.append(` ${text}`);
            container.appendChild(label);
        });
    };

    populateFilterOptions(cuisineContainer, cuisines, 'cuisine');
    populateFilterOptions(mealTypeContainer, mealTypes, 'mealType');
    populateFilterOptions(tagContainer, tags, 'tag');

    const ratings = [
        { value: '5', text: '5 Stars' },
        { value: '4', text: '4 Stars & Up' },
        { value: '3', text: '3 Stars & Up' },
        { value: '2', text: '2 Stars & Up' },
        { value: '1', text: '1 Star & Up' }
    ];
    populateFilterOptions(ratingContainer, ratings, 'rating', 'radio');

    const applyBtn = document.getElementById('apply-filters-btn');
    const resetBtn = document.getElementById('reset-filters-btn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const params = new URLSearchParams();

            document.querySelectorAll('#cuisine-filters input:checked').forEach(cb => params.append('cuisine', cb.value));
            document.querySelectorAll('#meal-type-filters input:checked').forEach(cb => params.append('mealType', cb.value));
            document.querySelectorAll('#tag-filters input:checked').forEach(cb => params.append('tag', cb.value));

            const checkedRating = document.querySelector('#rating-filters input:checked');
            if (checkedRating) {
                params.set('rating', checkedRating.value);
            }
            window.location.search = params.toString();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('#filter-menu input[type="checkbox"], #filter-menu input[type="radio"]').forEach(input => {
                input.checked = false;
            });
            window.location.search = '';
        });
    }
}

function updateFilterUIFromURLParams(cuisinesParams, mealTypesParams, tagsParams, ratingParam) {
    const updateCheckboxes = (name, paramValues) => {
        const values = Array.isArray(paramValues) ? paramValues : [];
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);

        checkboxes.forEach(checkbox => {
            checkbox.checked = values.includes(checkbox.value);
        });
    };

    const updateRadioButtons = (name, paramValue) => {
        const radioButtons = document.querySelectorAll(`input[name="${name}"]`);

        if (!radioButtons.length) {
            return;
        }

        radioButtons.forEach(radio => {
            radio.checked = (paramValue && radio.value === paramValue);
        });
    };

    updateCheckboxes('cuisine', cuisinesParams);
    updateCheckboxes('mealType', mealTypesParams);
    updateCheckboxes('tag', tagsParams);
    updateRadioButtons('rating', ratingParam);
}