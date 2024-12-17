const express = require('express');
const { poolPromise } = require('../config/dbConfig');
const sql = require('mssql');

const router = express.Router();

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT proveedor, nombre 
      FROM base.proveedor 
      ORDER BY proveedor
    `);
    res.json(result.recordset); // Retorna los proveedores en formato JSON
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    res.status(500).send('Error al obtener proveedores');
  }
});

// Validar si un proveedor existe
router.post('/validar', async (req, res) => {
  const { compania, proveedor } = req.body;

  if (!compania || !proveedor) {
    return res.status(400).json({ error: 'Compañía o proveedor no proporcionados' });
  }

  try {
    const pool = await poolPromise;
    const query = `
      SELECT contribuyente 
      FROM ${compania}.proveedor 
      WHERE proveedor = @proveedor
    `;
    const result = await pool.request()
      .input('proveedor', sql.VarChar, proveedor)
      .query(query);

    if (result.recordset.length > 0) {
      res.json({ exists: true, contribuyente: result.recordset[0].contribuyente });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error al validar proveedor:', err);
    res.status(500).send('Error al validar proveedor');
  }
});

// Insertar un nuevo proveedor
router.post('/insertar', async (req, res) => {
  const { compania, proveedor } = req.body;

  if (!compania || !proveedor) {
    return res.status(400).json({ error: 'Compañía o proveedor no proporcionados' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si el proveedor ya existe
    const checkQuery = `
      SELECT proveedor 
      FROM ${compania}.proveedor 
      WHERE proveedor = @proveedor
    `;
    const checkResult = await pool.request()
      .input('proveedor', sql.VarChar, proveedor)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: 'El proveedor ya existe' });
    }

    // Insertar el proveedor desde la tabla base
    const insertQuery = `
      INSERT INTO ${compania}.proveedor (
        PROVEEDOR, NOMBRE, ALIAS, CONTACTO, CARGO, DIRECCION, E_MAIL, FECHA_INGRESO, 
        TELEFONO1, TELEFONO2, FAX, NOTAS, ACTIVO, CONTRIBUYENTE, MONEDA
      )
      SELECT 
        PROVEEDOR, NOMBRE, ALIAS, CONTACTO, CARGO, DIRECCION, E_MAIL, FECHA_INGRESO, 
        TELEFONO1, TELEFONO2, FAX, NOTAS, ACTIVO, CONTRIBUYENTE, MONEDA
      FROM base.proveedor 
      WHERE proveedor = @proveedor
    `;
    await pool.request()
      .input('proveedor', sql.VarChar, proveedor)
      .query(insertQuery);

    res.status(200).send('Proveedor insertado correctamente');
  } catch (err) {
    console.error('Error al insertar proveedor:', err);
    res.status(500).send('Error al insertar proveedor');
  }
});
// Replicar un proveedor entre compañías
router.post('/replicar', async (req, res) => {
  const { origen, destino, proveedor } = req.body;

  if (!origen || !destino || !proveedor) {
    return res.status(400).json({ error: 'Datos insuficientes para replicar el proveedor' });
  }

  try {
    const pool = await poolPromise;

    // 1. Obtener el contribuyente (NIT) asociado al proveedor desde la base origen
    const contribuyenteQuery = `
      SELECT contribuyente
      FROM ${origen}.proveedor
      WHERE proveedor = @proveedor
    `;
    const contribuyenteResult = await pool.request()
      .input('proveedor', sql.VarChar, proveedor)
      .query(contribuyenteQuery);

    if (contribuyenteResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado en la base origen.' });
    }

    const contribuyente = contribuyenteResult.recordset[0].contribuyente;

    // 2. Verificar si el NIT ya existe en la compañía destino
    const nitQuery = `
      SELECT NIT
      FROM ${destino}.nit
      WHERE NIT = @contribuyente
    `;
    const nitResult = await pool.request()
      .input('contribuyente', sql.VarChar, contribuyente)
      .query(nitQuery);

    // 3. Insertar el NIT si no existe
    if (nitResult.recordset.length === 0) {
      const insertNitQuery = `
        INSERT INTO ${destino}.nit (
          NIT, RAZON_SOCIAL, ALIAS, NOTAS, TIPO, USA_REPORTE_D151, ORIGEN, NUMERO_DOC_NIT, 
          SUCURSAL, EXTERIOR, DIRECCION, NATURALEZA, ACTIVO
        )
        SELECT NIT, RAZON_SOCIAL, ALIAS, NOTAS, TIPO, USA_REPORTE_D151, ORIGEN, NUMERO_DOC_NIT, 
          SUCURSAL, EXTERIOR, DIRECCION, NATURALEZA, ACTIVO
        FROM ${origen}.nit
        WHERE NIT = @contribuyente
      `;
      await pool.request()
        .input('contribuyente', sql.VarChar, contribuyente)
        .query(insertNitQuery);
      console.log(`NIT ${contribuyente} replicado en la compañía ${destino}.`);
    } else {
      console.log(`NIT ${contribuyente} ya existe en la compañía ${destino}.`);
    }

    // 4. Verificar si el proveedor ya existe en la compañía destino
    const checkQuery = `
      SELECT proveedor 
      FROM ${destino}.proveedor 
      WHERE proveedor = @proveedor
    `;
    const checkResult = await pool.request()
      .input('proveedor', sql.VarChar, proveedor)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: 'El proveedor ya existe en la compañía destino.' });
    }

    // 5. Replicar proveedor desde origen a destino
    const replicateQuery = `
      INSERT INTO ${destino}.proveedor (
        PROVEEDOR, NOMBRE, ALIAS, CONTACTO, CARGO, DIRECCION, E_MAIL, FECHA_INGRESO, 
        FECHA_ULT_MOV, TELEFONO1, TELEFONO2, FAX, ORDEN_MINIMA, DESCUENTO, TASA_INTERES_MORA, 
        LOCAL, CONGELADO, CONTRIBUYENTE, CONDICION_PAGO, MONEDA, PAIS, CATEGORIA_PROVEED, 
        MULTIMONEDA, SALDO, SALDO_LOCAL, SALDO_DOLAR, NOTAS, ACTIVO, AUTORETENEDOR, 
        SALDO_TRANS, SALDO_TRANS_LOCAL, SALDO_TRANS_DOLAR, PERMITE_DOC_GP, PARTICIPA_FLUJOCAJA, 
        USUARIO_CREACION, FECHA_HORA_CREACION, IMPUESTO1_INCLUIDO, ACEPTA_DOC_ELECTRONICO, 
        INTERNACIONES, usa_plame
      )
      SELECT 
        PROVEEDOR, NOMBRE, ALIAS, CONTACTO, CARGO, DIRECCION, E_MAIL, FECHA_INGRESO, 
        FECHA_ULT_MOV, TELEFONO1, TELEFONO2, FAX, ORDEN_MINIMA, DESCUENTO, TASA_INTERES_MORA, 
        LOCAL, CONGELADO, CONTRIBUYENTE, CONDICION_PAGO, MONEDA, PAIS, CATEGORIA_PROVEED, 
        MULTIMONEDA, SALDO, SALDO_LOCAL, SALDO_DOLAR, NOTAS, ACTIVO, AUTORETENEDOR, 
        SALDO_TRANS, SALDO_TRANS_LOCAL, SALDO_TRANS_DOLAR, PERMITE_DOC_GP, PARTICIPA_FLUJOCAJA, 
        USUARIO_CREACION, FECHA_HORA_CREACION, IMPUESTO1_INCLUIDO, ACEPTA_DOC_ELECTRONICO, 
        INTERNACIONES, usa_plame
      FROM ${origen}.proveedor
      WHERE proveedor = @proveedor
    `;
    await pool.request()
      .input('proveedor', sql.VarChar, proveedor)
      .query(replicateQuery);

    console.log(`Proveedor ${proveedor} replicado correctamente.`);
    res.status(200).json({ message: 'Proveedor replicado correctamente.' });
  } catch (err) {
    console.error('Error al replicar proveedor:', err);
    res.status(500).json({ error: `Error interno: ${err.message}` });
  }
});

module.exports = router;
