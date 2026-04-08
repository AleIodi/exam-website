# 🍳 Delicious Recipes - Advanced Vanilla Web App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript (ES6+)](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Frameworks](https://img.shields.io/badge/Frameworks-None-lightgrey?style=for-the-badge)

## 🎯 Overview
Project developed as a exam test.

**Delicious Recipes** is a complete, interactive, and responsive Web Application that consumes an external REST API (`dummyjson.com/recipes`). The architectural peculiarity of this project is its **100% Vanilla** nature: no JavaScript or CSS frameworks were used.

The goal is to demonstrate mastery of the foundational technologies of the Web (DOM Manipulation, Fetch API, CSS Grid/Flexbox), a fundamental prerequisite before abstracting logic with modern frameworks.

## 🏗 Architecture and Design Decisions

### 1. JavaScript Engine & State Management
* **Logical Modularity**: Although there is no bundler, the JS code is divided by domain of competence (`global.js`, `home.js`, `risultati.js`, `dettagli.js`), ensuring Separation of Concerns.
* **Async/Await & Fetch API**: Modern network call management, with the implementation of a solid **Error Handling** system and conditional rendering of loading states (`Loading`, `Success`, `Error`).
* **Simulated Routing (Client-Side)**: Passing search states and filters through the `URLSearchParams` object, mimicking the behavior of a SPA (Single Page Application).

### 2. CSS Architecture & UI/UX
* **Custom Design System**: Extensive use of CSS Custom Properties (`:root` Variables) in the `main.css` file to define a consistent color palette, spacing, and typography, ensuring maintainability and scalability.
* **Responsive Web Design**: Fluid approach with `clamp()` functions for typography and a hybrid layout system based on `CSS Grid` and `Flexbox`. Complete adaptability from ultra-wide desktop screens to small mobile devices (360px).
* **Custom UI Components**: Scratch implementation of complex components like a navigable Sidebar, animated dropdowns, multiple search filters, and a card-based layout system (Recipe Cards).

### 3. SEO & Advanced Web Features
* **Dynamic JSON-LD Injection (Schema.org)**: The `dettagli.js` file manipulates the DOM to dynamically inject the `<script type="application/ld+json">` schema, populating it with specific recipe data. This ensures that search engine crawlers (like Google) can generate *Rich Snippets*, demonstrating advanced attention to SEO performance.

## 🚀 Key Features

* **Combined Multiple Filters**: The user can filter the API by category (Italian, International), Meal Type, Tags, and Rating, in real-time.
* **Dynamic Breadcrumbs**: Contextualized navigation within the detail page.
* **Accessibility (a11y)**: Dynamic `aria` attributes, defined focus states for keyboard navigation, and secure overlay management.

## 🛠 Local Setup Instructions

Being a purely client-side project in Vanilla JS, no compilers or `node_modules` are required.

1. Clone this repository:
   ```bash
   git clone https://github.com/AleIodi/exam-website.git
2. Open the project folder in your favorite text editor (e.g., VS Code).
3.  Run the project via Live Server (VS Code extension) to ensure CORS-friendly API calls work correctly on the local host.
4.  The entry point of the application is index.html.

