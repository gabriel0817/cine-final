const cartelera = document.getElementById("cartelera");
const logoutButton = document.getElementById("logout");  

// Cargar películas desde el backend
async function cargarCartelera() {
    try {
        const response = await fetch("http://localhost:3000/peliculas/");
        const peliculas = await response.json();

        if (response.ok) {
            cartelera.innerHTML = peliculas.map(pelicula => `
                <div class="card">
                    <img src="${pelicula.imagen_poster}" alt="${pelicula.titulo}">
                    <div class="card-content">
                        <h3 class="card-title">${pelicula.titulo}</h3>
                        <p class="card-info">Género: ${pelicula.genero}</p>  <!-- Corregido: 'Genero' a 'Género' -->
                        <p class="card-info">Duración: ${pelicula.duracion} min</p>
                        <button onclick="verDetalles(${pelicula.id})">Ver Detalles</button>
                    </div>
                </div>
            `).join("");
        } else {
            cartelera.innerHTML = `<p>No hay películas disponibles en este momento</p>`; 
        }
    } catch (error) {
        console.error("Error al cargar la cartelera:", error);
        cartelera.innerHTML = `<p>Error al cargar la cartelera</p>`;
    }
}

cargarCartelera();

// Función para ver los detalles de una película
function verDetalles(id) {
    window.location.href = `detalle.html?id=${id}`;
}

// Cerrar sesión
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});
