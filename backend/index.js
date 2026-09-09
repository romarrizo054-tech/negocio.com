const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =====================================================
// CONFIGURACIÓN DEL SERVIDOR
// =====================================================

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// =====================================================
// CONEXIÓN A MYSQL / AIVEN
// =====================================================

console.log("==========================================");
console.log("🔌 INICIANDO SERVIDOR");
console.log("==========================================");

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// =====================================================
// CREAR TABLAS
// =====================================================

async function crearTablas() {

    // CATEGORÍAS
    await db.query(`
        CREATE TABLE IF NOT EXISTS categorias (
            id_categoria INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL UNIQUE
        )
    `);

    // PRODUCTOS
    await db.query(`
        CREATE TABLE IF NOT EXISTS productos (
            id_producto INT AUTO_INCREMENT PRIMARY KEY,
            id_categoria INT,
            nombre VARCHAR(150) NOT NULL,
            costo DECIMAL(10,2) NOT NULL DEFAULT 0,
            precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
            stock_actual INT NOT NULL DEFAULT 0,
            stock_minimo INT NOT NULL DEFAULT 0,
            FOREIGN KEY (id_categoria)
                REFERENCES categorias(id_categoria)
        )
    `);

    // VENTAS (con campo cliente añadido)
    await db.query(`
        CREATE TABLE IF NOT EXISTS ventas (
            id_venta INT AUTO_INCREMENT PRIMARY KEY,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metodo_pago VARCHAR(50) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            cliente VARCHAR(150) NOT NULL DEFAULT 'Cliente General',
            cliente_fiado VARCHAR(150) NULL,
            estado_fiado VARCHAR(30) NULL DEFAULT NULL
        )
    `);

    // DETALLE DE VENTAS
    await db.query(`
        CREATE TABLE IF NOT EXISTS detalle_ventas (
            id_detalle INT AUTO_INCREMENT PRIMARY KEY,
            id_venta INT NOT NULL,
            id_producto INT NOT NULL,
            cantidad INT NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (id_venta)
                REFERENCES ventas(id_venta)
                ON DELETE CASCADE,
            FOREIGN KEY (id_producto)
                REFERENCES productos(id_producto)
        )
    `);

    // GASTOS
    await db.query(`
        CREATE TABLE IF NOT EXISTS movimientos_gastos (
            id_gasto INT AUTO_INCREMENT PRIMARY KEY,
            id_categoria INT DEFAULT 1,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tipo VARCHAR(50) NOT NULL,
            descripcion TEXT NOT NULL,
            monto DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (id_categoria)
                REFERENCES categorias(id_categoria)
        )
    `);

    console.log("✅ Tablas verificadas y listas.");
}

// =====================================================
// DATOS INICIALES
// =====================================================

async function insertarDatosIniciales() {
    const categorias = ["General", "Joyas", "Perfumes", "Maquillaje"];

    for (const nombre of categorias) {
        await db.query(`
            INSERT INTO categorias (nombre)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1 FROM categorias WHERE nombre = ?
            )
        `, [nombre, nombre]);
    }

    console.log("✅ Categorías base verificadas:", categorias);

    const [productos] = await db.query(`
        SELECT id_producto FROM productos WHERE id_producto = 1 LIMIT 1
    `);

    if (productos.length === 0) {
        const [categoria] = await db.query(`
            SELECT id_categoria FROM categorias WHERE nombre = 'General' LIMIT 1
        `);

        const idCategoria = categoria.length > 0 ? categoria[0].id_categoria : 1;

        await db.query(`
            INSERT INTO productos (id_categoria, nombre, costo, precio_venta, stock_actual, stock_minimo)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [idCategoria, "Producto de Prueba", 100, 150, 10, 2]);

        console.log("✅ Producto base creado.");
    } else {
        console.log("✅ Producto base ya existe.");
    }
}

// =====================================================
// RUTA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {
    res.json({
        mensaje: "🚀 API negocio.com funcionando correctamente",
        estado: "OK"
    });
});

// =====================================================
// CATEGORÍAS
// =====================================================

app.get("/api/categorias", async (req, res) => {
    try {
        const [resultados] = await db.query(`
            SELECT id_categoria, nombre FROM categorias ORDER BY nombre ASC
        `);
        res.json(resultados);
    } catch (error) {
        console.error("❌ ERROR CATEGORÍAS:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// PRODUCTOS
// =====================================================

app.get("/api/productos", async (req, res) => {
    try {
        const [resultados] = await db.query(`
            SELECT
                p.id_producto,
                p.id_categoria,
                p.nombre,
                p.costo,
                p.precio_venta,
                p.stock_actual,
                p.stock_minimo,
                c.nombre AS nombre_categoria,
                (p.precio_venta - p.costo) AS ganancia_unitaria,
                ((p.precio_venta - p.costo) * p.stock_actual) AS ganancia_stock
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            ORDER BY p.id_producto DESC
        `);
        res.json(resultados);
    } catch (error) {
        console.error("❌ ERROR PRODUCTOS:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.post("/api/productos", async (req, res) => {
    try {
        const { id_categoria, nombre, costo, precio_venta, stock_actual, stock_minimo } = req.body;

        if (!nombre || costo === undefined || precio_venta === undefined || stock_actual === undefined || stock_minimo === undefined) {
            return res.status(400).json({ error: "Faltan datos obligatorios del producto" });
        }

        const [resultado] = await db.query(`
            INSERT INTO productos (id_categoria, nombre, costo, precio_venta, stock_actual, stock_minimo)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            id_categoria || 1,
            nombre,
            Number(costo),
            Number(precio_venta),
            Number(stock_actual),
            Number(stock_minimo)
        ]);

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            id_producto: resultado.insertId
        });
    } catch (error) {
        console.error("❌ ERROR CREANDO PRODUCTO:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.put("/api/productos/:id", async (req, res) => {
    try {
        const id_producto = Number(req.params.id);
        const { id_categoria, nombre, costo, precio_venta, stock_actual, stock_minimo } = req.body;

        if (!nombre || costo === undefined || precio_venta === undefined || stock_actual === undefined || stock_minimo === undefined) {
            return res.status(400).json({ error: "Faltan datos obligatorios del producto" });
        }

        const [resultado] = await db.query(`
            UPDATE productos
            SET id_categoria = ?, nombre = ?, costo = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ?
            WHERE id_producto = ?
        `, [
            id_categoria || 1,
            nombre,
            Number(costo),
            Number(precio_venta),
            Number(stock_actual),
            Number(stock_minimo),
            id_producto
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ mensaje: "Producto actualizado correctamente", id_producto });
    } catch (error) {
        console.error("❌ ERROR EDITANDO PRODUCTO:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.delete("/api/productos/:id", async (req, res) => {
    try {
        const id_producto = Number(req.params.id);
        const [resultado] = await db.query(`DELETE FROM productos WHERE id_producto = ?`, [id_producto]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("❌ ERROR ELIMINANDO PRODUCTO:", error);
        if (error.errno === 1451) {
            return res.status(400).json({ error: "No puedes eliminar un producto que ya tiene ventas registradas." });
        }
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// VENTAS
// =====================================================

app.post("/api/ventas", async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { cliente, metodo_pago, total, detalles, cliente_fiado, estado_fiado } = req.body;

        if (!metodo_pago || total === undefined || !Array.isArray(detalles) || detalles.length === 0) {
            connection.release();
            return res.status(400).json({ error: "Datos de venta incompletos" });
        }

        await connection.beginTransaction();

        for (const item of detalles) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);
            const precio = Number(item.precio_unitario);

            if (!idProducto || !cantidad || cantidad < 1 || precio < 0) {
                throw new Error("Los datos de uno de los productos son inválidos.");
            }

            const [productos] = await connection.query(`
                SELECT id_producto, nombre, stock_actual FROM productos WHERE id_producto = ? FOR UPDATE
            `, [idProducto]);

            if (productos.length === 0) {
                throw new Error(`El producto ${idProducto} no existe.`);
            }

            if (productos[0].stock_actual < cantidad) {
                throw new Error(`Stock insuficiente para "${productos[0].nombre}".`);
            }
        }

        const [resultadoVenta] = await connection.query(`
            INSERT INTO ventas (cliente, metodo_pago, total, cliente_fiado, estado_fiado)
            VALUES (?, ?, ?, ?, ?)
        `, [
            cliente || 'Cliente General',
            metodo_pago,
            Number(total),
            metodo_pago === "Fiado" ? cliente_fiado || null : null,
            metodo_pago === "Fiado" ? estado_fiado || "pendiente" : null
        ]);

        const id_venta = resultadoVenta.insertId;

        for (const item of detalles) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);
            const precio = Number(item.precio_unitario);

            await connection.query(`
                INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            `, [id_venta, idProducto, cantidad, precio]);

            await connection.query(`
                UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?
            `, [cantidad, idProducto]);
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ mensaje: "Venta registrada con éxito", id_venta });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("❌ ERROR REGISTRANDO VENTA:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.get("/api/ventas", async (req, res) => {
    try {
        const [resultados] = await db.query(`
            SELECT
                v.id_venta,
                v.fecha,
                v.cliente,
                v.metodo_pago,
                v.total,
                v.cliente_fiado,
                v.estado_fiado,
                COUNT(dv.id_detalle) AS cantidad_productos,
                IFNULL(SUM(dv.cantidad), 0) AS unidades_vendidas
            FROM ventas v
            LEFT JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
            GROUP BY v.id_venta, v.fecha, v.cliente, v.metodo_pago, v.total, v.cliente_fiado, v.estado_fiado
            ORDER BY v.fecha DESC
        `);
        res.json(resultados);
    } catch (error) {
        console.error("❌ ERROR OBTENIENDO VENTAS:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.get("/api/ventas/:id", async (req, res) => {
    try {
        const idVenta = Number(req.params.id);
        if (!idVenta || idVenta < 1) {
            return res.status(400).json({ error: "ID de venta inválido" });
        }

        const [ventas] = await db.query(`SELECT id_venta FROM ventas WHERE id_venta = ? LIMIT 1`, [idVenta]);
        if (ventas.length === 0) {
            return res.status(404).json({ error: "La venta no existe" });
        }

        const [detalles] = await db.query(`
            SELECT
                v.id_venta,
                v.fecha,
                v.cliente,
                v.metodo_pago,
                v.total,
                v.cliente_fiado,
                v.estado_fiado,
                dv.id_detalle,
                dv.id_producto,
                p.nombre AS nombre_producto,
                dv.cantidad,
                dv.precio_unitario,
                (dv.precio_unitario * dv.cantidad) AS subtotal
            FROM ventas v
            LEFT JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
            LEFT JOIN productos p ON dv.id_producto = p.id_producto
            WHERE v.id_venta = ?
            ORDER BY dv.id_detalle ASC
        `, [idVenta]);

        res.json(detalles);
    } catch (error) {
        console.error("❌ ERROR OBTENIENDO DETALLE DE VENTA:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.put("/api/ventas/:id", async (req, res) => {
    const connection = await db.getConnection();
    try {
        const idVenta = Number(req.params.id);
        const { cliente, metodo_pago, total, cliente_fiado, estado_fiado, detalles } = req.body;

        if (!metodo_pago || total === undefined || !Array.isArray(detalles) || detalles.length === 0) {
            connection.release();
            return res.status(400).json({ error: "Datos de venta incompletos" });
        }

        await connection.beginTransaction();

        const [ventas] = await connection.query(`SELECT id_venta FROM ventas WHERE id_venta = ? FOR UPDATE`, [idVenta]);
        if (ventas.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        const [detallesAnteriores] = await connection.query(`
            SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = ?
        `, [idVenta]);

        for (const detalle of detallesAnteriores) {
            await connection.query(`
                UPDATE productos SET stock_actual = stock_actual + ? WHERE id_producto = ?
            `, [detalle.cantidad, detalle.id_producto]);
        }

        await connection.query(`DELETE FROM detalle_ventas WHERE id_venta = ?`, [idVenta]);

        for (const item of detalles) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);
            const precio = Number(item.precio_unitario);

            if (!idProducto || !cantidad || cantidad < 1 || precio < 0) {
                throw new Error("Los datos de uno de los productos son inválidos.");
            }

            const [productos] = await connection.query(`
                SELECT nombre, stock_actual FROM productos WHERE id_producto = ? FOR UPDATE
            `, [idProducto]);

            if (productos.length === 0) {
                throw new Error(`El producto ${idProducto} no existe.`);
            }

            if (productos[0].stock_actual < cantidad) {
                throw new Error(`Stock insuficiente para "${productos[0].nombre}".`);
            }
        }

        await connection.query(`
            UPDATE ventas
            SET cliente = ?, metodo_pago = ?, total = ?, cliente_fiado = ?, estado_fiado = ?
            WHERE id_venta = ?
        `, [
            cliente || 'Cliente General',
            metodo_pago,
            Number(total),
            metodo_pago === "Fiado" ? cliente_fiado || null : null,
            metodo_pago === "Fiado" ? estado_fiado || "pendiente" : null,
            idVenta
        ]);

        for (const item of detalles) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);
            const precio = Number(item.precio_unitario);

            await connection.query(`
                INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            `, [idVenta, idProducto, cantidad, precio]);

            await connection.query(`
                UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?
            `, [cantidad, idProducto]);
        }

        await connection.commit();
        connection.release();

        res.json({ mensaje: "Venta actualizada correctamente", id_venta: idVenta });
    } catch (error) {
        try { await connection.rollback(); } catch (e) {}
        connection.release();
        console.error("❌ ERROR ACTUALIZANDO VENTA:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.put("/api/ventas/:id/pagar", async (req, res) => {
    try {
        const idVenta = Number(req.params.id);
        const [resultado] = await db.query(`
            UPDATE ventas SET estado_fiado = 'pagado' WHERE id_venta = ? AND metodo_pago = 'Fiado'
        `, [idVenta]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Venta fiada no encontrada" });
        }

        res.json({ mensaje: "Venta marcada como pagada correctamente" });
    } catch (error) {
        console.error("❌ ERROR PAGANDO FIADO:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// GASTOS (HISTORIAL Y REGISTRO)
// =====================================================

app.get("/api/gastos", async (req, res) => {
    try {
        const [resultados] = await db.query(`
            SELECT
                g.id_gasto,
                g.id_categoria,
                c.nombre AS nombre_categoria,
                g.fecha,
                g.tipo,
                g.descripcion,
                g.monto
            FROM movimientos_gastos g
            LEFT JOIN categorias c ON g.id_categoria = c.id_categoria
            ORDER BY g.fecha DESC
        `);
        res.json(resultados || []);
    } catch (error) {
        console.error("❌ ERROR OBTENIENDO GASTOS:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

app.post("/api/gastos", async (req, res) => {
    try {
        const { id_categoria, tipo, descripcion, monto } = req.body;

        if (!tipo || !descripcion || monto === undefined) {
            return res.status(400).json({ error: "Faltan datos del gasto" });
        }

        const [resultado] = await db.query(`
            INSERT INTO movimientos_gastos (id_categoria, tipo, descripcion, monto)
            VALUES (?, ?, ?, ?)
        `, [
            id_categoria || 1,
            tipo,
            descripcion,
            Number(monto)
        ]);

        res.status(201).json({
            mensaje: "Gasto registrado con éxito",
            id_gasto: resultado.insertId
        });
    } catch (error) {
        console.error("❌ ERROR REGISTRANDO GASTO:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// DASHBOARD
// =====================================================

app.get("/api/dashboard", async (req, res) => {
    try {
        const idCategoria = req.query.id_categoria ? Number(req.query.id_categoria) : null;
        let filtroProductos = "";
        let filtroGastos = "";
        const parametrosProductos = [];
        const parametrosGastos = [];

        if (idCategoria) {
            filtroProductos = "AND p.id_categoria = ?";
            parametrosProductos.push(idCategoria);
            filtroGastos = "AND id_categoria = ?";
            parametrosGastos.push(idCategoria);
        }

        const [resultados] = await db.query(`
            SELECT
                (
                    SELECT IFNULL(SUM(dv.precio_unitario * dv.cantidad), 0)
                    FROM detalle_ventas dv
                    INNER JOIN ventas v ON dv.id_venta = v.id_venta
                    INNER JOIN productos p ON dv.id_producto = p.id_producto
                    WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE())
                      AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
                      ${filtroProductos}
                ) AS ingresos_brutos,
                (
                    SELECT IFNULL(SUM((dv.precio_unitario - p.costo) * dv.cantidad), 0)
                    FROM detalle_ventas dv
                    INNER JOIN ventas v ON dv.id_venta = v.id_venta
                    INNER JOIN productos p ON dv.id_producto = p.id_producto
                    WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE())
                      AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
                      ${filtroProductos}
                ) AS ganancia_neta,
                (
                    SELECT IFNULL(SUM(monto), 0)
                    FROM movimientos_gastos
                    WHERE MONTH(fecha) = MONTH(CURRENT_DATE())
                      AND YEAR(fecha) = YEAR(CURRENT_DATE())
                      ${filtroGastos}
                ) AS total_gastos
        `, [
            ...parametrosProductos,
            ...parametrosProductos,
            ...parametrosGastos
        ]);

        res.json(resultados[0]);
    } catch (error) {
        console.error("❌ ERROR DASHBOARD:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// GANANCIAS POR PRODUCTO
// =====================================================

app.get("/api/ganancias-productos", async (req, res) => {
    try {
        const idCategoria = req.query.id_categoria ? Number(req.query.id_categoria) : null;
        let filtro = "";
        const parametros = [];

        if (idCategoria) {
            filtro = "AND p.id_categoria = ?";
            parametros.push(idCategoria);
        }

        const [resultados] = await db.query(`
            SELECT
                p.id_producto,
                p.nombre,
                c.nombre AS nombre_categoria,
                IFNULL(SUM(dv.cantidad), 0) AS unidades_vendidas,
                p.costo,
                IFNULL(SUM((dv.precio_unitario - p.costo) * dv.cantidad), 0) AS ganancia_total
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
            LEFT JOIN ventas v ON dv.id_venta = v.id_venta
            WHERE 1 = 1
            ${filtro}
            GROUP BY p.id_producto, p.nombre, c.nombre, p.costo
            ORDER BY ganancia_total DESC
        `, parametros);

        res.json(resultados);
    } catch (error) {
        console.error("❌ ERROR GANANCIAS PRODUCTOS:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// ALERTAS DE STOCK
// =====================================================

app.get("/api/alertas-stock", async (req, res) => {
    try {
        const idCategoria = req.query.id_categoria ? Number(req.query.id_categoria) : null;
        let filtro = "";
        const parametros = [];

        if (idCategoria) {
            filtro = "AND id_categoria = ?";
            parametros.push(idCategoria);
        }

        const [resultados] = await db.query(`
            SELECT nombre, stock_actual, stock_minimo
            FROM productos
            WHERE stock_actual <= stock_minimo
            ${filtro}
            ORDER BY stock_actual ASC
        `, parametros);

        res.json(resultados || []);
    } catch (error) {
        console.error("❌ ERROR ALERTAS STOCK:", error);
        res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
    }
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

async function iniciarServidor() {
    try {
        console.log("🔌 Conectando a Aiven MySQL...");
        await db.query("SELECT 1");
        console.log("✅ ¡Conectado exitosamente a Aiven MySQL!");

        console.log("📦 Verificando tablas...");
        await crearTablas();

        console.log("🌱 Insertando datos iniciales...");
        await insertarDatosIniciales();

        app.listen(PORT, () => {
            console.log("==========================================");
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`🌐 API: http://localhost:${PORT}`);
            console.log("==========================================");
        });
    } catch (error) {
        console.error("==========================================");
        console.error("❌ ERROR INICIANDO EL SERVIDOR");
        console.error("==========================================");
        console.error("Mensaje:", error.message);
        console.error("Código:", error.code);
        console.error("Número:", error.errno);
        console.error("SQL:", error.sqlMessage);
        process.exit(1);
    }
}

iniciarServidor();