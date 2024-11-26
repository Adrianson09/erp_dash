const express = require('express');
const { poolPromise } = require('../config/dbConfig');
const router = express.Router();

router.delete('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().query(`DELETE FROM erpadmin.control`);
    res.status(200).send('Registros eliminados correctamente');
  } catch (err) {
    console.error('Error al eliminar registros:', err);
    res.status(500).send('Error al eliminar registros');
  }
});

module.exports = router;
