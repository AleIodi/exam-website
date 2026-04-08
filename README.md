# 🍳 Delicious Recipes - Advanced Vanilla Web App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript (ES6+)](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Frameworks](https://img.shields.io/badge/Frameworks-None-lightgrey?style=for-the-badge)

## 🎯 Overview
Progetto sviluppato come prova d'esame. 

**Delicious Recipes** è una Web Application completa, interattiva e responsiva che consuma un'API REST esterna (`dummyjson.com/recipes`). La particolarità architetturale di questo progetto è la sua natura **100% Vanilla**: nessun framework JavaScript o CSS è stato utilizzato. 

L'obiettivo è dimostrare una padronanza delle tecnologie fondanti del Web (DOM Manipulation, Fetch API, CSS Grid/Flexbox), prerequisito fondamentale prima di astrarre le logiche con framework moderni.

## 🏗 Architettura e Design Decisions

### 1. JavaScript Engine & State Management
*   **Modularità Logica**: Sebbene non ci sia un bundler, il codice JS è suddiviso per dominio di competenza (`global.js`, `home.js`, `risultati.js`, `dettagli.js`), garantendo la Separation of Concerns.
*   **Async/Await & Fetch API**: Gestione moderna delle chiamate di rete, con implementazione di un sistema solido di **Error Handling** e rendering condizionale degli stati di caricamento (`Loading`, `Success`, `Error`).
*   **Routing simulato (Client-Side)**: Passaggio degli stati e dei filtri di ricerca attraverso l'oggetto `URLSearchParams`, mimando il comportamento di una SPA (Single Page Application).

### 2. CSS Architecture & UI/UX
*   **Design System Custom**: Utilizzo estensivo di CSS Custom Properties (Variabili `:root`) nel file `main.css` per definire una palette colori coerente, spaziature e tipografia, garantendo manutenibilità e scalabilità.
*   **Responsive Web Design**: Approccio fluido con funzioni `clamp()` per la tipografia e un sistema di layout ibrido basato su `CSS Grid` e `Flexbox`. Completa adattabilità da schermi desktop ultra-wide a dispositivi mobile piccoli (360px).
*   **Custom UI Components**: Implementazione da zero di componenti complessi come Sidebar navigabile, dropdown animati, filtri di ricerca multipli e un sistema di layout a schede (Recipe Cards).

### 3. SEO & Advanced Web Features
*   **Dynamic JSON-LD Injection (Schema.org)**: Il file `dettagli.js` manipola il DOM per iniettare dinamicamente lo schema `<script type="application/ld+json">` popolandolo con i dati specifici della ricetta. Questo garantisce che i crawler dei motori di ricerca (come Google) possano generare *Rich Snippets*, dimostrando attenzione avanzata alle performance SEO.

## 🚀 Key Features

*   **Filtri Multipli Combinati**: L'utente può filtrare le API per categoria (Italian, International), Tipologia di pasto (Meal Type), Tags e Rating, in tempo reale.
*   **Dynamic Breadcrumbs**: Navigazione contestualizzata all'interno della pagina di dettaglio.
*   **Accessibility (a11y)**: Attributi `aria` dinamici, focus state definiti per la navigazione da tastiera e gestione sicura dell'overlay.

## 🛠 Istruzioni per l'Avvio (Local Setup)

Essendo un progetto puramente client-side in Vanilla JS, non sono necessari compilatori o node_modules.

1. Clona questa repository:
   ```bash
   git clone https://github.com/AleIodi/exam-website.git
Apri la cartella del progetto nel tuo editor preferito (es. VS Code).
Lancia il progetto tramite Live Server (estensione di VS Code) per garantire che le chiamate API CORS-friendly funzionino correttamente sull'host locale.
Il punto di ingresso dell'applicazione è index.html.
code
Code
***
