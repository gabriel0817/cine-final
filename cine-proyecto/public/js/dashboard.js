const nombreUsuario = document.getElementById("nombre-usuario");
const historialReservas = document.getElementById("historial-reservas");
const logoutButton = document.getElementById("logout");

//cargar nombre del usuario
const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
if (!usuarioActual) {
    window.location.href = "login.html"; 
} else {
    nombreUsuario.textContent = usuarioActual.nombre;
}

//cargar historial de reservas
async function cargarReservas() {
    try {
        const response = await fetch(`http://localhost:3000/reservas/ ${ usuarioActual.id}`);
        const reservas = await response.json();

        if (response.ok) {
            historialReservas.innerHTML = reservas.map(reserva => `
            <tr>
                <td>${reserva.titulo}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.asientos_reservados}</td>
                <td><button class="btn-cancelar" data-id="${reserva.id}">Cancelar</button></td>
            </tr>
            `).join("");
        } else {
            historialReservas.innerHTML = `<tr><td colspan="5">No se encontraron reservas para este usuario</td></tr>`;
        }
    } catch (error) {
        console.error("Error al cargar las reservas:", error);
        historialReservas.innerHTML = `<tr><td colspan="5">Error al cargar el historial</td></tr>`;
    }
}

cargarHistorial();

// Función para cancelar una reserva
async function cancelarReserva(id) {

    try {
        const response = await fetch(`http://localhost:3000/reservas/${Id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Reserva cancelada con éxito");
            cargarReservas(); // Recargar reservas tras cancelar
        } else {
            alert("Error al cancelar la reserva");
        }
    } catch (error) {
        console.error("Error al cancelar la reserva:", error);
    }
}

//cerrar sesión
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
});