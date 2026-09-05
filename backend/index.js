const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// CONEXIÓN A AIVEN MYSQL
// ==========================================

console.log(
    'Intentando conectar a:',
    process.env.DB_HOST,
    'con usuario:',
    process.env.DB_USER
);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false
    },
    multipleStatements: true
});

// ==========================================
// CREACIÓN DE TABLAS
// ==========================================

const crearTablas = `
    CREATE TABLE IF NOT EXISTS categorias (
        id_categoria INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS productos (
        id_producto INT AUTO_INCREMENT PRIMARY KEY,
        id_categoria INT,
        nombre VARCHAR(150) NOT NULL,
        costo DECIMAL(10,2) NOT NULL,
        precio_venta DECIMAL(10,2) NOT NULL,
        stock_actual INT NOT NULL,
        stock_minimo INT NOT NULL,
        FOREIGN KEY (id_categoria)
            REFERENCES categorias(id_categoria)
    );

    CREATE TABLE IF NOT EXISTS ventas (
        id_venta INT AUTO_INCREMENT PRIMARY KEY,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metodo_pago VARCHAR(50) NOT NULL,
        total DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS detalle_ventas (
        id_detalle INT AUTO_INCREMENT PRIMARY KEY,
        id_venta INT,
        id_producto INT,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (id_venta)
            REFERENCES ventas(id_venta),
        FOREIGN KEY (id_producto)
            REFERENCES productos(id_producto)
    );

    CREATE TABLE IF NOT EXISTS movimientos_gastos (
        id_gasto INT AUTO_INCREMENT PRIMARY KEY,
        id_categoria INT DEFAULT 1,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT NOT NULL,
        monto DECIMAL(10,2) NOT NULL
    );
`;

// ==========================================
// INICIAR BASE DE DATOS
// ==========================================

db.connect((err) => {

    if (err) {
        console.error('❌ Error conectando a Aiven:', err);
        return;
    }

    console.log('✅ Conectado exitosamente a Aiven MySQL');

    db.query(crearTablas, (error) => {

        if (error) {
            console.error('❌ Error al crear las tablas:', error);
            return;
        }

        console.log('✅ Tablas verificadas y listas');

        // ==========================================
        // DATOS INICIALES
        // ==========================================

        db.query(
            `INSERT IGNORE INTO categorias
            (id_categoria, nombre)
            VALUES
            (1, 'General'),
            (2, 'Indumentaria')`,
            (err) => {

                if (err) {
                    console.error('❌ Error insertando categorías:', err);
                } else {
                    console.log('✅ Categorías base verificadas');
                }
            }
        );

        db.query(
            `INSERT IGNORE INTO productos
            (id_producto, id_categoria, nombre, costo, precio_venta, stock_actual, stock_minimo)
            VALUES
            (1, 1, 'Producto de Prueba', 100.00, 150.00, 10, 2)`,
            (err) => {

                if (err) {
                    console.error('❌ Error insertando producto:', err);
                } else {
                    console.log('✅ Producto base verificado');
                }
            }
        );
    }
});

// ==========================================
// CATEGORÍAS
// ==========================================

app.get('/api/categorias', (req, res) => {
    db.query('SELECT * FROM categorias', (err, resultados) => {

        if (err) {
            console.error('❌ ERROR MYSQL CATEGORIAS:', err);

            return res.status(500).json({
                error: err.message,
                code: err.code,
                errno: err.errno,
                sqlMessage: err.sqlMessage
            });
        }

        console.log('✅ Categorías:', resultados);

        res.json(resultados);
    });
});

// ==========================================
// PRODUCTOS
// ==========================================

app.get('/api/productos', (req, res) => {

    const sql = `
        SELECT
            p.*,
            c.nombre AS nombre_categoria
        FROM productos p
        LEFT JOIN categorias c
            ON p.id_categoria = c.id_categoria
    `;

    db.query(sql, (err, resultados) => {

        if (err) {
            console.error('❌ Error /api/productos:', err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(resultados);
    });
});

// ==========================================
// CREAR PRODUCTO
// ==========================================

app.post('/api/productos', (req, res) => {

    const {
        id_categoria,
        nombre,
        costo,
        precio_venta,
        stock_actual,
        stock_minimo
    } = req.body;

    const sql = `
        INSERT INTO productos
        (
            id_categoria,
            nombre,
            costo,
            precio_venta,
            stock_actual,
            stock_minimo
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            id_categoria,
            nombre,
            costo,
            precio_venta,
            stock_actual,
            stock_minimo
        ],
        (err, resultado) => {

            if (err) {
                console.error('❌ Error POST /api/productos:', err);

                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                mensaje: '¡Producto guardado exitosamente!'
            });
        }
    );
});

// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

app.delete('/api/productos/:id', (req, res) => {

    const sql = `
        DELETE FROM productos
        WHERE id_producto = ?
    `;

    db.query(
        sql,
        [req.params.id],
        (err, resultado) => {

            if (err) {

                console.error(
                    '❌ Error DELETE /api/productos:',
                    err
                );

                if (err.errno === 1451) {
                    return res.status(400).json({
                        error:
                            'No puedes eliminar un producto que ya tiene ventas registradas.'
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                mensaje: 'Producto eliminado correctamente'
            });
        }
    );
});

// ==========================================
// VENTAS
// ==========================================

app.post('/api/ventas', (req, res) => {

    const {
        metodo_pago,
        total,
        detalles
    } = req.body;

    const sqlVenta = `
        INSERT INTO ventas
        (metodo_pago, total)
        VALUES (?, ?)
    `;

    db.query(
        sqlVenta,
        [metodo_pago, total],
        (err, resultadoVenta) => {

            if (err) {

                console.error(
                    '❌ Error registrando venta:',
                    err
                );

                return res.status(500).json({
                    error: err.message
                });
            }

            const id_venta = resultadoVenta.insertId;

            detalles.forEach(item => {

                db.query(
                    `
                    INSERT INTO detalle_ventas
                    (
                        id_venta,
                        id_producto,
                        cantidad,
                        precio_unitario
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        id_venta,
                        item.id_producto,
                        item.cantidad,
                        item.precio_unitario
                    ]
                );

                db.query(
                    `
                    UPDATE productos
                    SET stock_actual = stock_actual - ?
                    WHERE id_producto = ?
                    `,
                    [
                        item.cantidad,
                        item.id_producto
                    ]
                );
            });

            res.status(201).json({
                mensaje: 'Venta registrada con éxito'
            });
        }
    );
});

// ==========================================
// GASTOS
// ==========================================

app.post('/api/gastos', (req, res) => {

    const {
        id_categoria,
        tipo,
        descripcion,
        monto
    } = req.body;

    const sql = `
        INSERT INTO movimientos_gastos
        (
            id_categoria,
            tipo,
            descripcion,
            monto
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            id_categoria,
            tipo,
            descripcion,
            monto
        ],
        (err, resultado) => {

            if (err) {

                console.error(
                    '❌ Error registrando gasto:',
                    err
                );

                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                mensaje: 'Gasto registrado con éxito'
            });
        }
    );
});

// ==========================================
// DASHBOARD
// ==========================================

app.get('/api/dashboard', (req, res) => {

    const { id_categoria } = req.query;

    const filtroProd = id_categoria
        ? `AND p.id_categoria = ${db.escape(id_categoria)}`
        : '';

    const filtroGasto = id_categoria
        ? `AND id_categoria = ${db.escape(id_categoria)}`
        : '';

    const sql = `
        SELECT

            (
                SELECT IFNULL(
                    SUM(dv.precio_unitario * dv.cantidad),
                    0
                )
                FROM detalle_ventas dv
                JOIN ventas v
                    ON dv.id_venta = v.id_venta
                JOIN productos p
                    ON dv.id_producto = p.id_producto
                WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE())
                AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
                ${filtroProd}
            ) AS ingresos_brutos,

            (
                SELECT IFNULL(
                    SUM(
                        (dv.precio_unitario - p.costo)
                        * dv.cantidad
                    ),
                    0
                )
                FROM detalle_ventas dv
                JOIN ventas v
                    ON dv.id_venta = v.id_venta
                JOIN productos p
                    ON dv.id_producto = p.id_producto
                WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE())
                AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
                ${filtroProd}
            ) AS ganancia_neta,

            (
                SELECT IFNULL(
                    SUM(monto),
                    0
                )
                FROM movimientos_gastos
                WHERE MONTH(fecha) = MONTH(CURRENT_DATE())
                AND YEAR(fecha) = YEAR(CURRENT_DATE())
                ${filtroGasto}
            ) AS total_gastos
    `;

    db.query(sql, (err, resultados) => {

        if (err) {

            console.error(
                '❌ Error /api/dashboard:',
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(resultados[0]);
    });
});

// ==========================================
// ALERTAS DE STOCK
// ==========================================

app.get('/api/alertas-stock', (req, res) => {

    const { id_categoria } = req.query;

    const filtro = id_categoria
        ? `AND id_categoria = ${db.escape(id_categoria)}`
        : '';

    const sql = `
        SELECT
            nombre,
            stock_actual,
            stock_minimo
        FROM productos
        WHERE stock_actual <= stock_minimo
        ${filtro}
    `;

    db.query(sql, (err, resultados) => {

        if (err) {

            console.error(
                '❌ Error /api/alertas-stock:',
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(resultados);
    });
});

// ==========================================
// SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(` Servidor corriendo en el puerto ${PORT}`);
});