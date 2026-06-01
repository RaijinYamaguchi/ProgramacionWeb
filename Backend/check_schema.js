const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  // Check columns
  connection.query("DESC tokens_dispositivos", (err, results) => {
    if (err) {
      console.error('Error checking columns:', err);
      connection.release();
      process.exit(1);
    }
    
    console.log('Current columns:', results.map(r => r.Field));
    
    const requiredColumns = ['descripcion', 'expires_at', 'ultimo_uso'];
    const existingColumns = results.map(r => r.Field);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('All required columns exist!');
      connection.release();
      process.exit(0);
    }
    
    console.log('Missing columns:', missingColumns);
    
    // Add missing columns
    let completed = 0;
    
    if (missingColumns.includes('descripcion')) {
      connection.query(
        "ALTER TABLE tokens_dispositivos ADD COLUMN descripcion VARCHAR(255) AFTER dispositivo_id",
        (err) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') {
            console.error('Error adding descripcion:', err);
          } else {
            console.log('Added/verified descripcion column');
          }
          completed++;
          checkCompletion();
        }
      );
    } else {
      completed++;
      checkCompletion();
    }
    
    if (missingColumns.includes('expires_at')) {
      connection.query(
        "ALTER TABLE tokens_dispositivos ADD COLUMN expires_at DATETIME AFTER activo",
        (err) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') {
            console.error('Error adding expires_at:', err);
          } else {
            console.log('Added/verified expires_at column');
          }
          completed++;
          checkCompletion();
        }
      );
    } else {
      completed++;
      checkCompletion();
    }
    
    if (missingColumns.includes('ultimo_uso')) {
      connection.query(
        "ALTER TABLE tokens_dispositivos ADD COLUMN ultimo_uso DATETIME AFTER creado_en",
        (err) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') {
            console.error('Error adding ultimo_uso:', err);
          } else {
            console.log('Added/verified ultimo_uso column');
          }
          completed++;
          checkCompletion();
        }
      );
    } else {
      completed++;
      checkCompletion();
    }
    
    function checkCompletion() {
      if (completed === 3) {
        // Also increase token field size
        connection.query(
          "ALTER TABLE tokens_dispositivos MODIFY COLUMN token VARCHAR(500)",
          (err) => {
            if (err && err.code !== 'ER_DUP_FIELDNAME') {
              console.error('Error modifying token size:', err);
            } else {
              console.log('Modified token column size');
            }
            connection.release();
            process.exit(0);
          }
        );
      }
    }
  });
});
