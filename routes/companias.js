const express = require('express');
const { poolPromise } = require('../config/dbConfig');
const router = express.Router();

// Endpoint para obtener el listado de compañías
router.get('/companias', async (req, res) => {
  try {
    // Obtener la conexión al pool
    const pool = await poolPromise;

    // Realizar la consulta
    const result = await pool.request().query(`
      SELECT 
        conjunto, 
        nombre, 
        nit, 
        telefono,
        EMAIL_DOC_ELECTRONICO
      FROM ERPADMIN.CONJUNTO
    `);

    // Devolver el resultado como JSON
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error al obtener las compañías:', err.message);
    res.status(500).json({ error: 'Error al obtener las compañías. Por favor, inténtelo de nuevo más tarde.' });
  }
});

module.exports = router;
