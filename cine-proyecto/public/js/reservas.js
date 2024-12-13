// Obtener el mapa de asientos y los botones
const mapaAsientos = document.getElementById("mapa-asientos");
const btnConfirmar = document.getElementById("confirmar-reserva");

// ID de la película y del usuario (estos valores deben ser dinámicos)
const usuarioId = sessionStorage.getItem("usuarioId");
// Obtiene el ID de la película desde los parámetros de la URL
const params = new URLSearchParams(window.location.search);
const peliculaId = params.get("peliculaId");

if (!peliculaId) {
    alert("No se encontró el ID de la película. Asegúrate de que el enlace es correcto.");
    throw new Error("peliculaId no definido");
}


// Cargar asientos desde el back-end
async function cargarAsientos() {
    try {
        const response = await fetch(`/reservas/asientos/${peliculaId}`);
        if (!response.ok) {
            throw new Error("Error al cargar los asientos");
        }
        const data = await response.json();
        generarMapaAsientos(data.asientos);
    } catch (error) {
        console.error("Error al cargar los asientos:", error.message);
        alert("Hubo un problema al cargar el mapa de asientos.");
    }
}



// Manejar selección de asientos
let asientosSeleccionados = [];
function seleccionarAsiento(event) {
    const asientoDiv = event.target;
    const asientoId = asientoDiv.dataset.asientoId;

    // Alternar selección
    if (asientoDiv.classList.contains("seleccionado")) {
        asientoDiv.classList.remove("seleccionado");
        asientosSeleccionados = asientosSeleccionados.filter(
            (id) => id !== asientoId
        );
    } else {
        asientoDiv.classList.add("seleccionado");
        asientosSeleccionados.push(asientoId);
    }

    btnConfirmar.disabled = asientosSeleccionados.length === 0;
    console.log(asientosSeleccionados); // Verifica los asientos seleccionados
}

// Confirmar reserva con fecha y hora
btnConfirmar.addEventListener("click", async () => {
    const fechaSeleccionada = document.getElementById("fecha").value;
    const horaSeleccionada = document.getElementById("hora").value;

    if (!fechaSeleccionada || !horaSeleccionada) {
        alert("Por favor, selecciona una fecha y hora.");
        return;
    }

    try {
        const response = await fetch("/reservas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usuario_id: usuarioId,
                pelicula_id: peliculaId,
                asientos: asientosSeleccionados,
                fecha: fechaSeleccionada,
                hora: horaSeleccionada,
            }),
        });

        // Revisar si la respuesta es un error
        if (!response.ok) {
            const errorText = await response.text(); // Lee texto o mensaje de error
            console.error("Respuesta del servidor:", response.status, errorText);
            alert(errorText || "Error al realizar la reserva.");
            return;
        }

        const data = await response.json();
        alert("Reserva realizada con éxito");
        cargarAsientos();

        // Mostrar confirmación de reserva
        mostrarConfirmacionReserva(
            "Nombre de la Película", // Puedes cambiarlo dinámicamente
            fechaSeleccionada,
            horaSeleccionada,
            asientosSeleccionados
        );
    } catch (error) {
        console.error("Error al realizar la reserva:", error.message);
        // alert("Hubo un problema al confirmar la reserva.");
    }
});

function mostrarConfirmacionReserva(pelicula, fecha, hora, asientos) {
    const modal = document.getElementById("modal-confirmacion");
    modal.innerHTML = `
        <div class="modal-content">
            <h2>¡Reserva Confirmada!</h2>
            <p><strong>Película:</strong> ${pelicula}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Hora:</strong> ${hora}</p>
            <p><strong>Asientos:</strong> ${asientos.join(", ")}</p>
            <button id="cerrar-modal">Cerrar</button>
        </div>
    `;
    modal.style.display = "block";

    document.getElementById("cerrar-modal").addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// Llamar a esta función después de confirmar la reserva
// btnConfirmar.addEventListener("click", async () => {
//     try {
//         // Código para enviar la reserva al backend...
        
//         // Si todo sale bien, mostramos la confirmación
//         mostrarConfirmacionReserva("Nombre de la Película", fechaSeleccionada, "18:00", asientosSeleccionados);
//     } catch (error) {
//         console.error("Error al realizar la reserva:", error.message);
//         alert("Hubo un problema al confirmar la reserva.");
//     }
// });

// Generar el mapa de asientos dinámicamente
function generarMapaAsientos(asientos) {
    mapaAsientos.innerHTML = ""; // Limpiar el mapa actual
    asientos.forEach((asiento) => {
        const asientoDiv = document.createElement("div");
        asientoDiv.className = "asiento";
        asientoDiv.dataset.asientoId = asiento.id;
        asientoDiv.innerText = asiento.numero;

        // Si el asiento ya está reservado
        if (asiento.reservado) {
            asientoDiv.classList.add("reservado");
        } else {
            asientoDiv.addEventListener("click", seleccionarAsiento);
        }

        mapaAsientos.appendChild(asientoDiv);
    });
}
// Cargar los asientos al iniciar
cargarAsientos();
