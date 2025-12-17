// Constante para la clave de LocalStorage
const STORAGE_KEY = 'chuckNorrisJokes';

// Elementos del DOM (Asegúrate de que los IDs coincidan con tu HTML)
const fetchJokeButton = document.getElementById('fetchJoke');
const jokesListElement = document.getElementById('jokeList');

// =======================================================
// FUNCIONES DE PERSISTENCIA (LOCALSTORAGE)
// =======================================================

/**
 * Carga el array de chistes desde LocalStorage.
 * @returns {Array<Object>} Array de chistes.
 */
function loadJokesFromStorage() {
    const jokesJSON = localStorage.getItem(STORAGE_KEY);
    // Si hay datos, los parseamos. Si no, devolvemos un array vacío.
    // JSON.parse() convierte la cadena JSON de vuelta a un objeto/array JS.
    return jokesJSON ? JSON.parse(jokesJSON) : [];
}

/**
 * Guarda el array de chistes en LocalStorage.
 * @param {Array<Object>} jokesArray - El array de chistes a guardar.
 */
function saveJokesToStorage(jokesArray) {
    // Usamos JSON.stringify para convertir el array JS a una cadena JSON
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jokesArray));
}

// =======================================================
// FUNCIONES DE MANIPULACIÓN DEL DOM Y RENDERIZADO
// =======================================================

/**
 * Renderiza la lista completa de chistes en el DOM.
 * @param {Array<Object>} jokesArray - El array de chistes para mostrar.
 */
function renderJokes(jokesArray) {
    jokesListElement.innerHTML = ''; // Limpiar la lista existente

    if (jokesArray.length === 0) {
        jokesListElement.innerHTML = '<li>¡Aún no hay chistes! Haz clic en "Obtener Chiste".</li>';
        return;
    }

    jokesArray.forEach(joke => {
        const li = document.createElement('li');
        li.className = 'joke-item';
        // Usamos el ID del chiste como un atributo data en el LI para referencia
        li.dataset.jokeId = joke.id; 

        li.innerHTML = `
            <span class="joke-text">${joke.value}</span>
            <button class="delete-button" data-joke-id="${joke.id}">Eliminar</button>
        `;

        jokesListElement.appendChild(li);
    });
}

/**
 * Elimina un chiste específico por su ID.
 * @param {string} jokeId - El ID del chiste a eliminar.
 */
function deleteSingleJoke(jokeId) {
    // 1. Cargar la lista actual
    let currentJokes = loadJokesFromStorage();
    
    // 2. Filtrar para crear un nuevo array sin el chiste a eliminar
    const updatedJokes = currentJokes.filter(joke => joke.id !== jokeId);
    
    // 3. Guardar la nueva lista en LocalStorage
    saveJokesToStorage(updatedJokes);
    
    // 4. Actualizar el DOM
    renderJokes(updatedJokes);
}

// =======================================================
// FUNCIÓN PRINCIPAL DE OBTENCIÓN DE DATOS
// =======================================================

/**
 * Obtiene un chiste de la API, lo añade al array y actualiza el DOM/Storage.
 */
async function getNewJoke() {
    try {
        // 1. Obtener el chiste de la API
        const response = await fetch('https://api.chucknorris.io/jokes/random');
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }
        const newJoke = await response.json();
        
        // 2. Cargar los chistes existentes
        const currentJokes = loadJokesFromStorage();

        // 3. Verificar si el chiste ya existe (opcional pero evita duplicados)
        const isDuplicate = currentJokes.some(joke => joke.id === newJoke.id);
        
        if (!isDuplicate) {
            // 4. Añadir el nuevo chiste al inicio del array (opcional, para ver el último primero)
            currentJokes.unshift(newJoke); 
            
            // 5. Guardar la lista actualizada
            saveJokesToStorage(currentJokes);
            
            // 6. Actualizar el DOM
            renderJokes(currentJokes);
        } else {
            // Si es duplicado, intenta obtener otro chiste (recursivamente)
            getNewJoke();
        }

    } catch (error) {
        console.error("Error al obtener el chiste:", error);
        alert("No se pudo obtener el chiste. Revisa la conexión o la URL de la API.");
    }
}

// =======================================================
// MANEJADORES DE EVENTOS E INICIALIZACIÓN
// =======================================================

// A. Manejador de clic para obtener un nuevo chiste
fetchJokeButton.addEventListener('click', getNewJoke);

// B. Delegación de eventos para la eliminación individual
// Usamos el contenedor UL y verificamos qué elemento fue clickeado
jokesListElement.addEventListener('click', (event) => {
    // Verificar si el elemento clickeado tiene la clase 'delete-button'
    if (event.target.classList.contains('delete-button')) {
        const jokeIdToDelete = event.target.dataset.jokeId;
        if (jokeIdToDelete) {
            deleteSingleJoke(jokeIdToDelete);
        }
    }
});

// C. Inicialización: Cargar chistes al cargar la página
(function initializeApp() {
    const initialJokes = loadJokesFromStorage();
    renderJokes(initialJokes);
})();