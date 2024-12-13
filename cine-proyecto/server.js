const express = require("express");
const path = require("path");
const pool = require("./public/js/db");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Middleware global
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "cine",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

// Middleware para verificar autenticación
function autenticarUsuario(req, res, next) {
    if (!req.session.usuarioId) {
        return res.status(401).json({ message: "No autenticado, por favor inicia sesión" });
    }
    next();
}

// *** BLOQUE 1: AUTENTICACIÓN ***
app.post("/api/registro", async (req, res) => {
    const { nombre, correo_electronico, contraseña } = req.body;

    try {
        const usuarioExistente = await pool.query(
            "SELECT * FROM usuarios WHERE correo_electronico = $1", 
            [correo_electronico]
        );
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

        await pool.query(
            "INSERT INTO usuarios (nombre, correo_electronico, contraseña) VALUES ($1, $2, $3)",
            [nombre, correo_electronico, contraseñaEncriptada]
        );

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (err) {
        console.error("Error en registro:", err.message);
        res.status(500).json({ message: "Error al registrar el usuario" });
    }
});

app.post("/usuarios/login", async (req, res) => {
    const { correo_electronico, contraseña } = req.body;

    try {
        const usuario = await pool.query(
            "SELECT * FROM usuarios WHERE correo_electronico = $1", 
            [correo_electronico]
        );

        if (usuario.rows.length === 0 || !(await bcrypt.compare(contraseña, usuario.rows[0].contraseña))) {
            return res.status(400).json({ message: "Correo o contraseña incorrectos" });
        }

        req.session.usuarioId = usuario.rows[0].id;
        req.session.nombre = usuario.rows[0].nombre;

        res.json({ 
            message: `Bienvenido, ${usuario.rows[0].nombre}`,
            usuario: { id: usuario.rows[0].id, nombre: usuario.rows[0].nombre },
        });
    } catch (err) {
        console.error("Error en login:", err.message);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
});

function autenticarAdministrador(req, res, next) {
    if (!req.session || !req.session.usuarioId) {
        return res.status(401).json({ message: "No has iniciado sesión" });
    }

    pool.query(
        "SELECT rol FROM usuarios WHERE id = $1",
        [req.session.usuarioId],
        (err, result) => {
            if (err) {
                console.error("Error al verificar el rol:", err.message);
                return res.status(500).json({ message: "Error al verificar el rol" });
            }

            const usuario = result.rows[0];
            if (!usuario || usuario.rol !== "administrador") {
                return res.status(403).json({ message: "Acceso denegado" });
            }

            next();
        }
    );
}



// *** BLOQUE 2: RUTAS DE PELÍCULAS ***
app.get("/peliculas", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM peliculas");
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener las películas:", err.message);
        res.status(500).send("Error al obtener las películas");
    }
});
//
// Ruta para obtener los detalles de una película específica por su ID
app.get("/peliculas/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM peliculas WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: "Película no encontrada" });
        }
    } catch (error) {
        console.error("Error al obtener los detalles de la película:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});


// *** BLOQUE 3: RUTAS DE RESERVAS ***

// Ruta para realizar reservas
app.post("/reservas", autenticarUsuario, async (req, res) => {
    const { pelicula_id, asientos, fecha, hora } = req.body; 
    const usuarioId = req.session.usuarioId;

    console.log('datos resividos para la reserva',req.body); // Debugging: Verifica los datos recibidos
    
    try {
        // Validar datos obligatorios
        if (!pelicula_id || !asientos || asientos.length === 0 || !fecha || !hora) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        // Construir los valores para la inserción
        const valores = asientos
            .map(
                (asientoId) =>
                    `(${usuarioId}, ${pelicula_id}, ${asientoId}, '${fecha}', '${hora}')`
            )
            .join(", ");

        // Insertar reservas en la tabla
        await pool.query(
            `INSERT INTO reservas (usuario_id, pelicula_id, asiento_id, fecha, hora) 
            VALUES ${valores}`
        );

        // Actualizar estado de los asientos
        await pool.query(
            `UPDATE asientos SET reservado = true WHERE id = ANY($1::int[])`,
            [asientos]
        );

        res.status(201).json({ message: "Reserva realizada con éxito" });
    } catch (err) {
        // console.error("Error al realizar la reserva:", err.message);
        res.status(500).json({ message: "Error al realizar la reserva" });
    }
});

app.get("/reservas/listado", autenticarAdministrador, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.id, r.fecha, u.nombre AS usuario, p.titulo AS pelicula, r.asiento_id
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN peliculas p ON r.pelicula_id = p.id
            ORDER BY r.fecha;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener el listado de reservas:", error.message);
        res.status(500).json({ message: "Error al obtener las reservas" });
    }
});


// Ruta para obtener asientos por película
app.get("/reservas/asientos/:pelicula_id", async (req, res) => {
    const { pelicula_id } = req.params;

    try {
        // Consultar asientos asociados a la película
        const result = await pool.query(
            "SELECT id, numero, reservado FROM asientos WHERE pelicula_id = $1",
            [pelicula_id]
        );

        console.log(result.rows); // Debugging: Verifica los datos obtenidos
        res.json({ asientos: result.rows });
    } catch (err) {
        console.error("Error al obtener los asientos:", err.message);
        res.status(500).json({ message: "Error al obtener los asientos" });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
