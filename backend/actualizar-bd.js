const mysql = require('mysql2');
require('dotenv').config();

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

db.connect((err) => {

    if (err) {
        console.error('❌ Error conectando a Aiven:');
        console.error(err);
        return;
    }

    console.log('✅ Conectado a Aiven');

    const sql = `
        ALTER TABLE ventas
        ADD COLUMN cliente_fiado VARCHAR(150) NULL,
        ADD COLUMN estado_fiado VARCHAR(30) NULL DEFAULT NULL,
        ADD COLUMN cliente VARCHAR(150) DEFAULT 'Cliente General'
    `;

    db.query(sql, (err) => {

        if (err) {
            console.error('❌ Error modificando la tabla ventas:');
            console.error(err);
            db.end();
            return;
        }

        console.log('✅ Tabla ventas actualizada correctamente');
        console.log('✅ Se agregaron cliente_fiado y estado_fiado');

        db.end();
    });
});