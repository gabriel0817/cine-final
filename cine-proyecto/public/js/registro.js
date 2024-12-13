const formRegistro = document.getElementById("form-registro");
const mensaje = document.getElementById("mensaje");

formRegistro.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const contraseña = document.getElementById("contraseña").value;
    const confirmacionContraseña = document.getElementById("confirmar-contraseña").value;

    // Verificar que las contraseñas coinciden
    if (contraseña !== confirmacionContraseña) {
        mensaje.style.display = "block";
        mensaje.textContent = "Las contraseñas no coinciden";
        mensaje.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo_electronico: correo, contraseña }), // Envía la contraseña tal cual
        });

        const data = await response.json();
        mensaje.style.display = "block";
        mensaje.textContent = data.message;

        if (response.ok) {
            mensaje.style.color = "green";
            setTimeout(() => window.location.href = "login.html", 2000); // Redirigir al login
        } else {
            mensaje.style.color = "red";
        }
    } catch (err) {
        console.error("Error al registrar", err);
        mensaje.style.display = "block";
        mensaje.style.color = "red";
        mensaje.textContent = "Error al registrar";
    }
});
