const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ==========================================
// CONFIGURACIÓN DEL SERVIDOR
// ==========================================

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ==========================================
// CONEXIÓN A AIVEN MYSQL
// ==========================================

console.log('==========================================');
console.log('🔌 INICIANDO SERVIDOR');
console.log('==========================================');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: {
        rejectUnauthorized: false
    }
});

// ==========================================
// CREACIÓN DE TABLAS
// ==========================================

const crearTablas = async () => {

    const tablas = [

        // ==========================================
        // CATEGORÍAS
        // ==========================================

        `
        CREATE TABLE IF NOT EXISTS categorias (
            id_categoria INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL UNIQUE
        )
        `,

        // ==========================================
        // PRODUCTOS
        // ==========================================

        `
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
        )
        `,

        // ==========================================
        // VENTAS
        // ==========================================

        `
        CREATE TABLE IF NOT EXISTS ventas (
            id_venta INT AUTO_INCREMENT PRIMARY KEY,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metodo_pago VARCHAR(50) NOT NULL,
            total DECIMAL(10,2) NOT NULL
        )
        `,

        // ==========================================
        // DETALLE DE VENTAS
        // ==========================================

        `
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
        )
        `,

        // ==========================================
        // GASTOS
        // ==========================================

        `
        CREATE TABLE IF NOT EXISTS movimientos_gastos (
            id_gasto INT AUTO_INCREMENT PRIMARY KEY,
            id_categoria INT DEFAULT 1,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tipo VARCHAR(50) NOT NULL,
            descripcion TEXT NOT NULL,
            monto DECIMAL(10,2) NOT NULL
        )
        `
    ];

    for (const sql of tablas) {
        await db.promise().query(sql);
    }

    console.log('✅ Tablas verificadas y listas.');
};

// ==========================================
// DATOS INICIALES
// ==========================================

const insertarDatosIniciales = async () => {

    // ==========================================
    // CATEGORÍAS BASE
    // ==========================================

    const categorias = [
        'General',
        'Joyas',
        'Perfumes',
        'Maquillaje'
    ];

    for (const nombre of categorias) {

        await db.promise().query(
            `
            INSERT INTO categorias (nombre)
            SELECT ?
            WHERE NOT EXISTS (
                SELECT 1
                FROM categorias
                WHERE nombre = ?
            )
            `,
            [nombre, nombre]
        );
    }

    console.log('✅ Categorías base verificadas:', categorias);

    // ==========================================
    // PRODUCTO DE PRUEBA
    // ==========================================

    const [productos] = await db.promise().query(
        `
        SELECT id_producto
        FROM productos
        WHERE id_producto = 1
        `
    );

    if (productos.length === 0) {

        const [categoriaGeneral] = await db.promise().query(
            `
            SELECT id_categoria
            FROM categorias
            WHERE nombre = 'General'
            LIMIT 1
            `
        );

        const idCategoria =
            categoriaGeneral.length > 0
                ? categoriaGeneral[0].id_categoria
                : 1;

        await db.promise().query(
            `
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
            `,
            [
                idCategoria,
                'Producto de Prueba',
                100.00,
                150.00,
                10,
                2
            ]
        );

        console.log('✅ Producto base creado.');

    } else {

        console.log('✅ Producto base ya existe.');
    }
};

// ==========================================
// OBTENER CATEGORÍAS
// ==========================================

app.get('/api/categorias', (req, res) => {

    db.query(
        `
        SELECT
            id_categoria,
            nombre
        FROM categorias
        ORDER BY nombre ASC
        `,
        (err, resultados) => {

            if (err) {

                console.error(
                    '❌ ERROR MYSQL CATEGORIAS:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage
                });
            }

            res.json(resultados);
        }
    );
});

// ==========================================
// OBTENER PRODUCTOS
// ==========================================

app.get('/api/productos', (req, res) => {

    const sql = `
        SELECT
            p.*,
            c.nombre AS nombre_categoria
        FROM productos p
        LEFT JOIN categorias c
            ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto DESC
    `;

    db.query(
        sql,
        (err, resultados) => {

            if (err) {

                console.error(
                    '❌ ERROR MYSQL PRODUCTOS:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage
                });
            }

            res.json(resultados);
        }
    );
});

// ==========================================
// CREAR PRODUCTO
// ==========================================

// ==========================================
// OBTENER PRODUCTOS
// ==========================================

app.get('/api/productos', (req, res) => {

    const sql = `
        SELECT
            p.id_producto,
            p.id_categoria,
            p.nombre,
            p.costo,
            p.precio_venta,
            p.stock_actual,
            p.stock_minimo,

            c.nombre AS nombre_categoria,

            (p.precio_venta - p.costo)
                AS ganancia_unitaria,

            (
                (p.precio_venta - p.costo)
                * p.stock_actual
            )
                AS ganancia_stock

        FROM productos p

        LEFT JOIN categorias c
            ON p.id_categoria = c.id_categoria

        ORDER BY p.id_producto DESC
    `;

    db.query(
        sql,
        (err, resultados) => {

            if (err) {

                console.error(
                    '❌ ERROR MYSQL PRODUCTOS:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage
                });
            }

            res.json(resultados);
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
                    '❌ ERROR AL ELIMINAR PRODUCTO:',
                    err
                );

                if (err.errno === 1451) {

                    return res.status(400).json({
                        error:
                            'No puedes eliminar un producto que ya tiene ventas registradas.'
                    });
                }

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    sqlMessage: err.sqlMessage
                });
            }

            res.json({
                mensaje: 'Producto eliminado correctamente'
            });
        }
    );
});

// ==========================================
// REGISTRAR VENTA
// ==========================================

app.post('/api/ventas', (req, res) => {

    const {
        metodo_pago,
        total,
        detalles
    } = req.body;

    if (
        !metodo_pago ||
        total === undefined ||
        !Array.isArray(detalles) ||
        detalles.length === 0
    ) {

        return res.status(400).json({
            error: 'Datos de venta incompletos'
        });
    }

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
                    '❌ ERROR AL REGISTRAR VENTA:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    sqlMessage: err.sqlMessage
                });
            }

            const id_venta = resultadoVenta.insertId;

            let pendientes = detalles.length;
            let huboError = false;

            detalles.forEach(item => {

                const sqlDetalle = `
                    INSERT INTO detalle_ventas
                    (
                        id_venta,
                        id_producto,
                        cantidad,
                        precio_unitario
                    )
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    sqlDetalle,
                    [
                        id_venta,
                        item.id_producto,
                        item.cantidad,
                        item.precio_unitario
                    ],
                    (errDetalle) => {

                        if (errDetalle && !huboError) {

                            huboError = true;

                            console.error(
                                '❌ ERROR DETALLE VENTA:',
                                errDetalle
                            );

                            return res.status(500).json({
                                error: errDetalle.message,
                                code: errDetalle.code,
                                sqlMessage: errDetalle.sqlMessage
                            });
                        }

                        if (!errDetalle) {

                            db.query(
                                `
                                UPDATE productos
                                SET stock_actual =
                                    stock_actual - ?
                                WHERE id_producto = ?
                                `,
                                [
                                    item.cantidad,
                                    item.id_producto
                                ],
                                (errStock) => {

                                    if (errStock && !huboError) {

                                        huboError = true;

                                        console.error(
                                            '❌ ERROR ACTUALIZANDO STOCK:',
                                            errStock
                                        );

                                        return res.status(500).json({
                                            error: errStock.message,
                                            code: errStock.code,
                                            sqlMessage: errStock.sqlMessage
                                        });
                                    }

                                    pendientes--;

                                    if (
                                        pendientes === 0 &&
                                        !huboError
                                    ) {

                                        res.status(201).json({
                                            mensaje:
                                                'Venta registrada con éxito',
                                            id_venta
                                        });
                                    }
                                }
                            );

                        } else {

                            pendientes--;
                        }
                    }
                );
            });
        }
    );
});

// ==========================================
// EDITAR PRODUCTO
// ==========================================

app.put('/api/productos/:id', (req, res) => {

    const id_producto = req.params.id;

    const {
        id_categoria,
        nombre,
        costo,
        precio_venta,
        stock_actual,
        stock_minimo
    } = req.body;

    // ==========================================
    // VALIDAR DATOS
    // ==========================================

    if (
        !nombre ||
        costo === undefined ||
        precio_venta === undefined ||
        stock_actual === undefined ||
        stock_minimo === undefined
    ) {
        return res.status(400).json({
            error: 'Faltan datos obligatorios del producto'
        });
    }

    // ==========================================
    // ACTUALIZAR PRODUCTO
    // ==========================================

    const sql = `
        UPDATE productos
        SET
            id_categoria = ?,
            nombre = ?,
            costo = ?,
            precio_venta = ?,
            stock_actual = ?,
            stock_minimo = ?
        WHERE id_producto = ?
    `;

    db.query(
        sql,
        [
            id_categoria || 1,
            nombre,
            costo,
            precio_venta,
            stock_actual,
            stock_minimo,
            id_producto
        ],
        (err, resultado) => {

            if (err) {

                console.error(
                    '❌ ERROR AL EDITAR PRODUCTO:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    sqlMessage: err.sqlMessage
                });
            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                mensaje: 'Producto actualizado correctamente',
                id_producto: Number(id_producto)
            });
        }
    );
});

// ==========================================
// REGISTRAR GASTO
// ==========================================

app.post('/api/gastos', (req, res) => {

    const {
        id_categoria,
        tipo,
        descripcion,
        monto
    } = req.body;

    if (
        !tipo ||
        !descripcion ||
        monto === undefined
    ) {

        return res.status(400).json({
            error: 'Faltan datos del gasto'
        });
    }

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
            id_categoria || 1,
            tipo,
            descripcion,
            monto
        ],
        (err, resultado) => {

            if (err) {

                console.error(
                    '❌ ERROR AL REGISTRAR GASTO:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    sqlMessage: err.sqlMessage
                });
            }

            res.status(201).json({
                mensaje: 'Gasto registrado con éxito',
                id_gasto: resultado.insertId
            });
        }
    );
});

// ==========================================
// DASHBOARD
// ==========================================

app.get('/api/dashboard', (req, res) => {

    const {
        id_categoria
    } = req.query;

    let filtroProd = '';
    let filtroGasto = '';

    if (id_categoria) {

        filtroProd =
            `AND p.id_categoria = ${db.escape(id_categoria)}`;

        filtroGasto =
            `AND id_categoria = ${db.escape(id_categoria)}`;
    }

    const sql = `
        SELECT

            (
                SELECT IFNULL(
                    SUM(
                        dv.precio_unitario *
                        dv.cantidad
                    ),
                    0
                )
                FROM detalle_ventas dv

                JOIN ventas v
                    ON dv.id_venta = v.id_venta

                JOIN productos p
                    ON dv.id_producto = p.id_producto

                WHERE
                    MONTH(v.fecha) =
                        MONTH(CURRENT_DATE())

                    AND YEAR(v.fecha) =
                        YEAR(CURRENT_DATE())

                    ${filtroProd}
            ) AS ingresos_brutos,

            (
                SELECT IFNULL(
                    SUM(
                        (
                            dv.precio_unitario -
                            p.costo
                        ) *
                        dv.cantidad
                    ),
                    0
                )
                FROM detalle_ventas dv

                JOIN ventas v
                    ON dv.id_venta = v.id_venta

                JOIN productos p
                    ON dv.id_producto = p.id_producto

                WHERE
                    MONTH(v.fecha) =
                        MONTH(CURRENT_DATE())

                    AND YEAR(v.fecha) =
                        YEAR(CURRENT_DATE())

                    ${filtroProd}
            ) AS ganancia_neta,

            (
                SELECT IFNULL(
                    SUM(monto),
                    0
                )
                FROM movimientos_gastos

                WHERE
                    MONTH(fecha) =
                        MONTH(CURRENT_DATE())

                    AND YEAR(fecha) =
                        YEAR(CURRENT_DATE())

                    ${filtroGasto}
            ) AS total_gastos
    `;

    db.query(
        sql,
        (err, resultados) => {

            if (err) {

                console.error(
                    '❌ ERROR DASHBOARD:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    sqlMessage: err.sqlMessage
                });
            }

            res.json(resultados[0]);
        }
    );
});

// ==========================================
// ALERTAS DE STOCK
// ==========================================

app.get('/api/alertas-stock', (req, res) => {

    const {
        id_categoria
    } = req.query;

    let filtro = '';

    if (id_categoria) {

        filtro =
            `AND id_categoria = ${db.escape(id_categoria)}`;
    }

    const sql = `
        SELECT
            nombre,
            stock_actual,
            stock_minimo
        FROM productos
        WHERE stock_actual <= stock_minimo
        ${filtro}
        ORDER BY stock_actual ASC
    `;

    db.query(
        sql,
        (err, resultados) => {

            if (err) {

                console.error(
                    '❌ ERROR ALERTAS STOCK:',
                    err
                );

                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                    sqlMessage: err.sqlMessage
                });
            }

            res.json(resultados);
        }
    );
});

// ==========================================
// RUTA DE PRUEBA
// ==========================================

app.get('/', (req, res) => {

    res.json({
        mensaje: '🚀 API negocio.com funcionando correctamente',
        estado: 'OK'
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const iniciarServidor = async () => {

    try {

        console.log('🔌 Conectando a Aiven MySQL...');

        await db.promise().connect();

        console.log(
            '✅ ¡Conectado exitosamente a Aiven MySQL!'
        );

        console.log('📦 Verificando tablas...');

        await crearTablas();

        console.log('🌱 Insertando datos iniciales...');

        await insertarDatosIniciales();

        app.listen(PORT, () => {

            console.log('==========================================');
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log('==========================================');

        });

    } catch (error) {

        console.error(
            '=========================================='
        );

        console.error(
            '❌ ERROR INICIANDO EL SERVIDOR'
        );

        console.error(
            '=========================================='
        );

        console.error('Mensaje:', error.message);
        console.error('Código:', error.code);
        console.error('Número:', error.errno);
        console.error('SQL:', error.sqlMessage);

        process.exit(1);
    }
};

iniciarServidor();