async function cargarReservas() {
    try {
        const response = await fetch("/reservas/listado");
        if (!response.ok) throw new Error("Error al cargar el listado");

        const reservas = await response.json();
        const tbody = document.getElementById("reservas-listado");

        reservas.forEach(reserva => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${reserva.id}</td>
                <td>${reserva.usuario}</td>
                <td>${reserva.pelicula}</td>
                <td>${reserva.asiento_id}</td>
                <td>${reserva.fecha}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar el listado de reservas:", error.message);
    }
}

cargarReservas();
