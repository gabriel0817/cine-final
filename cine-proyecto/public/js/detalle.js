const detallePelicula = document.getElementById("detalle-pelicula");
const reservarBtn = document.getElementById("reservar-btn");
const logoutButton = document.getElementById("logout");

//obtener ID de la película desde la URL
const params = new URLSearchParams(window.location.search);
const peliculaId = params.get("id");

//cargar detalles de la película
async function cargarDetalles() {
    try {
        const response = await fetch(`http://localhost:3000/peliculas/${peliculaId}`);
        const pelicula = await response.json();

        if (response.ok) {
            detallePelicula.innerHTML = `
                <img src="${pelicula.imagen_poster}" alt="${pelicula.titulo}">
                <h2>${pelicula.titulo}</h2>
                <p><strong>Genero:</strong> ${pelicula.genero}</p>
                <p><strong>Duracion:</strong> ${pelicula.duracion} min</p>
                <p><strong>Clasificacion:</strong> ${pelicula.clasificacion}</p>;
                <p><strong>Sinopsis:</strong> ${pelicula.sinopsis} </p>
            `;
        } else {
            detallePelicula.innerHTML = `<p>error al cargar los detalles de la pelicula</p>`;
        }
    } catch (error) {
        console.error("Error al cargar los detalles de la pelicula:", error);
        detallePelicula.innerHTML = `<p>Error al cargar los detalles de la pelicula</p>`;
    }
}

cargarDetalles();

// redirigir a la pagina de reservas
reservarBtn.addEventListener("click", () => {
    window.location.href = `reservas.html?peliculaId=${peliculaId}`;
});

//cerrar sesión
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});