const express = require('express');
const { poolPromise, sql } = require('../config/dbConfig');
const router = express.Router();

// Ruta para obtener el listado de órdenes por compañía y estado
router.get('/ordenes', async (req, res) => {
  try {
    const { compania } = req.query;

    // Validar que el parámetro "compania" esté presente
    if (!compania) {
      return res.status(400).json({ error: 'El parámetro "compania" es obligatorio.' });
    }

    // Obtener la conexión al pool
    const pool = await poolPromise;

    // Realizar la consulta
    const result = await pool.request().query(`
        SELECT 
          oco.ORDEN_COMPRA,
          oco.PROVEEDOR,
          pro.NOMBRE AS NOMBRE_PROVEEDOR,
          oco.MONEDA,
          oco.TOTAL_MERCADERIA,
          oco.ESTADO,
          oco.FECHA
        FROM ${compania}.ORDEN_COMPRA oco
        LEFT JOIN ${compania}.PROVEEDOR pro ON pro.PROVEEDOR = oco.PROVEEDOR
       
        ORDER BY oco.ORDEN_COMPRA
    `);

    // Validar si no hay resultados
    if (!result.recordset.length) {
      return res.status(404).json({ error: 'No se encontraron órdenes para la compañía especificada.' });
    }

    // Devolver los resultados como JSON
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error al obtener las órdenes:', err.message);
    res.status(500).json({ error: 'Error interno al obtener las órdenes de compra.' });
  }
});

module.exports = router;
