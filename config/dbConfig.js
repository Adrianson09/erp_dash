const sql = require('mssql');
require('dotenv').config();

// Configuración de la conexión a SQL Server
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false, // Cambia a true si tu servidor requiere conexiones cifradas
    enableArithAbort: true, // Mejora la gestión de errores en cálculos
  },
};

// Crear un pool de conexiones y manejar errores
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('Conexión a SQL Server establecida');
    return pool;
  })
  .catch((err) => {
    console.error('Error al conectar a SQL Server:', err.message);
    throw new Error('No se pudo conectar a la base de datos.');
  });

module.exports = {
  sql,
  poolPromise,
};
