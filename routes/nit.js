const express = require('express');
const { poolPromise } = require('../config/dbConfig');
const sql = require('mssql');

const router = express.Router();

// Validar un NIT en la base de datos
router.post('/validar', async (req, res) => {
  const { compania, contribuyente, tipo } = req.body;

  if (!compania || !contribuyente || !tipo) {
    return res.status(400).json({ error: 'Compañía, contribuyente o tipo no proporcionados' });
  }

  try {
    const pool = await poolPromise;

    let table = '';
    if (tipo === 'proveedor') {
      table = `${compania}.nit`;
    } else if (tipo === 'cliente') {
      table = `${compania}.cliente`;
    } else {
      return res.status(400).json({ error: 'Tipo no válido, debe ser "proveedor" o "cliente"' });
    }

    const query = `
      SELECT NIT
      FROM ${table}
      WHERE NIT = @contribuyente
    `;

    const result = await pool.request()
      .input('contribuyente', sql.VarChar, contribuyente)
      .query(query);

    if (result.recordset.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error al validar el NIT:', err);
    res.status(500).send('Error al validar el NIT');
  }
});

// Insertar un nuevo NIT
router.post('/insertar', async (req, res) => {
  const { compania, contribuyente, tipo } = req.body;

  if (!compania || !contribuyente || !tipo) {
    return res.status(400).json({ error: 'Compañía, contribuyente o tipo no proporcionados' });
  }

  try {
    const pool = await poolPromise;

    let table = '';
    if (tipo === 'proveedor') {
      table = `${compania}.nit`;
    } else if (tipo === 'cliente') {
      table = `${compania}.cliente`;
    } else {
      return res.status(400).json({ error: 'Tipo no válido, debe ser "proveedor" o "cliente"' });
    }

    const checkQuery = `
      SELECT NIT
      FROM ${table}
      WHERE NIT = @contribuyente
    `;
    const checkResult = await pool.request()
      .input('contribuyente', sql.VarChar, contribuyente)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: 'El NIT ya existe' });
    }

    const insertQuery = `
      INSERT INTO ${table} (NIT, RAZON_SOCIAL, ALIAS, NOTAS, TIPO, USA_REPORTE_D151, ORIGEN, NUMERO_DOC_NIT, SUCURSAL, EXTERIOR, DIRECCION, NATURALEZA, ACTIVO)
      SELECT NIT, RAZON_SOCIAL, ALIAS, NOTAS, TIPO, USA_REPORTE_D151, ORIGEN, NUMERO_DOC_NIT, SUCURSAL, EXTERIOR, DIRECCION, NATURALEZA, ACTIVO
      FROM BASE.nit
      WHERE NIT = @contribuyente
    `;
    await pool.request()
      .input('contribuyente', sql.VarChar, contribuyente)
      .query(insertQuery);

    res.status(200).send('NIT insertado correctamente');
  } catch (err) {
    console.error('Error al insertar el NIT:', err);
    res.status(500).send('Error al insertar el NIT');
  }
});

module.exports = router;
