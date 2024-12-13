const usuarioId = 1; // Cambia este ID por el del usuario actual
const tablaReservas = document.getElementById('tabla-reservas').querySelector('tbody');
const mensaje = document.getElementById('mensaje');

// Función para cargar el historial de reservas
async function cargarReservas() {
    try {
        const response = await fetch(`http://localhost:3000/reservas/${usuarioId}`);
        if (!response.ok) {
            mensaje.style.display = 'block';
            mensaje.textContent = 'No se encontraron reservas';
            return;
        }

        const reservas = await response.json();
        tablaReservas.innerHTML = '';

        reservas.forEach(reserva => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
        <td>${reserva.titulo}</td>
        <td>${reserva.fecha}</td>
        <td>${reserva.hora}</td>
        <td>${reserva.asientos_reservados}</td>
        <td>
          <button class="btn-cancelar" data-id="${reserva.id}">Cancelar</button>
        </td>
      `;

            tablaReservas.appendChild(fila);
        });

        // Agregar eventos a los botones de cancelar
        document.querySelectorAll('.btn-cancelar').forEach(btn => {
            btn.addEventListener('click', cancelarReserva);
        });
    } catch (err) {
        console.error('Error al cargar las reservas:', err);
    }
}

// Función para cancelar una reserva
async function cancelarReserva(event) {
    const reservaId = event.target.dataset.id;

    try {
        const response = await fetch(`http://localhost:3000/reservas/${reservaId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        if (response.ok) {
            mensaje.style.display = 'block';
            mensaje.textContent = data.message;
            cargarReservas(); // Recargar reservas tras cancelar
        } else {
            mensaje.style.display = 'block';
            mensaje.textContent = data.message || 'Error al cancelar la reserva';
        }
    } catch (err) {
        console.error('Error al cancelar la reserva:', err);
    }
}

// Cargar las reservas al cargar la página
cargarReservas();
