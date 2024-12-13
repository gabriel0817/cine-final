const formLogin = document.getElementById("form-login");
const mensaje = document.getElementById("mensaje");

formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correo").value;
    const contraseña = document.getElementById("contraseña").value;

    try {
        const response = await fetch("http://localhost:3000/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo_electronico: correo, contraseña }),
        });

        const data = await response.json();
        mensaje.style.display = "block";
        mensaje.textContent = data.message;

        if (response.ok) {
            mensaje.style.color = "green";
            setTimeout(() => window.location.href = "cartelera.html", 2000); // Redirigir al login
        } else {
            mensaje.style.color = "red";
        }
    } catch (err) {
        console.error("error al iniciar sesion", err);
        mensaje.style.display = "block";
        mensaje.style.color = "red";
        mensaje.textContent = "Error al iniciar sesion";
    }
});