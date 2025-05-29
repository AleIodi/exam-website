// ========================================================
// JS per metodi utili e elementi presenti in ogni pagina
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    scrollTopBtn?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    })
});

function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

function createElement(tag, className, innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

function initSidebar() {
    document.querySelectorAll("#mySidebar .dropdown-btn").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            this.classList.toggle("active");

            const dropdownContent = this.nextElementSibling;
            if (!dropdownContent?.classList.contains('dropdown-container')) return;

            const isExpanded = this.classList.contains("active");
            dropdownContent.style.display = isExpanded ? "block" : "none";

            const icon = this.querySelector('.icon-up');
            if (icon) animateRotation(icon, isExpanded ? 180 : 0);
        });
    });

    document.addEventListener('click', (event) => {
        const sidebar = document.getElementById('mySidebar');
        const menuButton = document.querySelector('.icon-menu');

        if (sidebar?.style.width === "275px") {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnMenuButton = menuButton?.contains(event.target) || event.target === menuButton;

            if (!isClickInsideSidebar && !isClickOnMenuButton) {
                closeNav();
            }
        }
    });

    document.addEventListener('keydown', (event) => {
        const sidebar = document.getElementById('mySidebar');
        if (event.key === 'Escape' && sidebar?.style.width === "275px") {
            closeNav();
        }
        if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('dropdown-btn')) {
            event.preventDefault();
            event.target.click();
        }
    });
}

function animateRotation(element, degrees) {
    if (!element) return;
    element.getAnimations().forEach(anim => anim.cancel());
    const currentTransform = getComputedStyle(element).transform;
    const targetTransform = `rotate(${degrees}deg)`;
    if (currentTransform === targetTransform && !element.getAnimations().length) return;

    element.animate(
        [
            { transform: currentTransform === 'none' ? 'rotate(0deg)' : currentTransform },
            { transform: targetTransform }
        ],
        { duration: 300, fill: 'forwards', easing: 'ease-in-out' }
    ).onfinish = () => {
        element.style.transform = targetTransform;
    };
}

window.openNav = function () {
    updateSidebar(true);
}

window.closeNav = function () {
    updateSidebar(false);
}

function updateSidebar(isOpen) {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("main");
    const overlay = document.getElementById("myOverlay");
    const menuButton = document.querySelector('.icon-menu');

    if (!sidebar) return;

    sidebar.style.width = isOpen ? "275px" : "0";
    if (main) main.style.opacity = isOpen ? "0.7" : "1";
    if (overlay) overlay.classList.toggle("active", isOpen);

    const firstDropdownButton = sidebar.querySelector(".dropdown-btn");
    if (firstDropdownButton) {
        const dropdownContent = firstDropdownButton.nextElementSibling;
        const icon = firstDropdownButton.querySelector(".icon-up");

        firstDropdownButton.classList.toggle("active", isOpen);
        if (dropdownContent?.classList.contains('dropdown-container')) {
            dropdownContent.style.display = isOpen ? "block" : "none";
        }
        if (icon) animateRotation(icon, isOpen ? 180 : 0);
    }

    if (!isOpen && menuButton && document.activeElement !== menuButton) {
        menuButton.focus();
    }
}

function populateSidebarCuisines(cuisinesArray) {
    const sideBarContainer = document.getElementById('dropdown-container');
    if (!sideBarContainer || !Array.isArray(cuisinesArray)) return;

    clearElement(sideBarContainer);
    const fragment = document.createDocumentFragment();
    const all = createElement('a');
    all.title = "Discover all our delicious recipes";
    all.href = "risultati.html";
    all.innerHTML = "<h4>All Recipes</h4>";
    fragment.appendChild(all)
    fragment.appendChild(all);
    cuisinesArray.forEach(cuisine => {
        if (!cuisine) return;
        const link = createElement('a');
        link.title = `View all ${cuisine} recipes`;
        link.href = `risultati.html?cuisine=${encodeURIComponent(cuisine)}`;
        link.innerHTML = `<h4>${cuisine}</h4>`;
        fragment.appendChild(link);
    });
    sideBarContainer.appendChild(fragment);
}

function populateFooterMealTypes(mealTypesArray) {
    const categoriesContainer = document.querySelector('.footer-categories-list');
    if (!categoriesContainer || !Array.isArray(mealTypesArray)) return;

    clearElement(categoriesContainer);
    const displayMealTypes = mealTypesArray.sort().slice(0, 10);

    categoriesContainer.innerHTML = displayMealTypes.map(type =>
        `<li><a href="risultati.html?mealType=${encodeURIComponent(type)}" title="View all ${type} recipes">${type}</a></li>`
    ).join('');
}