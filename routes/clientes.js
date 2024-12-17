const express = require('express');
const { poolPromise } = require('../config/dbConfig');
const sql = require('mssql');

const router = express.Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT cliente, nombre
      FROM base.cliente
      ORDER BY cliente
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).send('Error al obtener clientes');
  }
});

// Validar un cliente en una compañía
router.post('/validar', async (req, res) => {
  const { compania, cliente } = req.body;

  if (!compania || !cliente) {
    return res.status(400).json({ error: 'Compañía o cliente no proporcionados' });
  }

  try {
    const pool = await poolPromise;
    const query = `
      SELECT cliente
      FROM ${compania}.cliente
      WHERE cliente = @cliente
    `;
    const result = await pool.request().input('cliente', sql.VarChar, cliente).query(query);

    if (result.recordset.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error al validar cliente:', err);
    res.status(500).send('Error al validar cliente');
  }
});

// Insertar un nuevo cliente
router.post('/insertar', async (req, res) => {
  const { compania, cliente } = req.body;

  if (!compania || !cliente) {
    return res.status(400).json({ error: 'Compañía o cliente no proporcionados' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si ya existe el cliente
    const checkQuery = `
      SELECT cliente
      FROM ${compania}.cliente
      WHERE cliente = @cliente
    `;
    const checkResult = await pool.request().input('cliente', sql.VarChar, cliente).query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: 'El cliente ya existe' });
    }

    // Insertar cliente desde la base general
    const insertQuery = `
      INSERT INTO ${compania}.cliente (cliente, nombre, alias, contacto, cargo,direccion, dir_emb_default,telefono1, telefono2, fax, contribuyente, fecha_ingreso,MULTIMONEDA, moneda, saldo, saldo_local,
			saldo_dolar, saldo_credito, saldo_nocargos,limite_credito, exceder_limite, tasa_interes, tasa_interes_mora,fecha_ult_mora ,fecha_ult_mov,condicion_pago, nivel_precio,descuento,moneda_nivel,
			ACEPTA_BACKORDER,PAIS,ZONA,RUTA,VENDEDOR,COBRADOR,ACEPTA_FRACCIONES,ACTIVO,EXENTO_IMPUESTOS,EXENCION_IMP1,EXENCION_IMP2,COBRO_JUDICIAL,CATEGORIA_CLIENTE,CLASE_ABC,DIAS_ABASTECIMIEN,USA_TARJETA,E_MAIL,
			REQUIERE_OC,ES_CORPORACION,REGISTRARDOCSACORP,USAR_DIREMB_CORP,APLICAC_ABIERTAS,VERIF_LIMCRED_CORP,USAR_DESC_CORP,DOC_A_GENERAR,TIENE_CONVENIO,NOTAS,DIAS_PROMED_ATRASO,ASOCOBLIGCONTFACT,USAR_PRECIOS_CORP,
			USAR_EXENCIMP_CORP,AJUSTE_FECHA_COBRO,CLASE_DOCUMENTO,LOCAL,TIPO_CONTRIBUYENTE,ACEPTA_DOC_ELECTRONICO,CONFIRMA_DOC_ELECTRONICO,ACEPTA_DOC_EDI,NOTIFICAR_ERROR_EDI,MOROSO,MODIF_NOMB_EN_FAC,SALDO_TRANS,SALDO_TRANS_LOCAL
			,SALDO_TRANS_DOLAR,PERMITE_DOC_GP,PARTICIPA_FLUJOCAJA,USUARIO_CREACION,DETALLAR_KITS)
      SELECT cliente, nombre, alias, contacto, cargo,direccion, dir_emb_default,telefono1, telefono2, fax, contribuyente, fecha_ingreso,MULTIMONEDA, moneda, saldo, saldo_local,
			saldo_dolar, saldo_credito, saldo_nocargos,limite_credito, exceder_limite, tasa_interes, tasa_interes_mora,fecha_ult_mora ,fecha_ult_mov,condicion_pago, nivel_precio,descuento,moneda_nivel,
			ACEPTA_BACKORDER,PAIS,ZONA,RUTA,VENDEDOR,COBRADOR,ACEPTA_FRACCIONES,ACTIVO,EXENTO_IMPUESTOS,EXENCION_IMP1,EXENCION_IMP2,COBRO_JUDICIAL,CATEGORIA_CLIENTE,CLASE_ABC,DIAS_ABASTECIMIEN,USA_TARJETA,E_MAIL,
			REQUIERE_OC,ES_CORPORACION,REGISTRARDOCSACORP,USAR_DIREMB_CORP,APLICAC_ABIERTAS,VERIF_LIMCRED_CORP,USAR_DESC_CORP,DOC_A_GENERAR,TIENE_CONVENIO,NOTAS,DIAS_PROMED_ATRASO,ASOCOBLIGCONTFACT,USAR_PRECIOS_CORP,
			USAR_EXENCIMP_CORP,AJUSTE_FECHA_COBRO,CLASE_DOCUMENTO,LOCAL,TIPO_CONTRIBUYENTE,ACEPTA_DOC_ELECTRONICO,CONFIRMA_DOC_ELECTRONICO,ACEPTA_DOC_EDI,NOTIFICAR_ERROR_EDI,MOROSO,MODIF_NOMB_EN_FAC,SALDO_TRANS,SALDO_TRANS_LOCAL
			,SALDO_TRANS_DOLAR,PERMITE_DOC_GP,PARTICIPA_FLUJOCAJA,USUARIO_CREACION,DETALLAR_KITS
      FROM base.cliente
      WHERE cliente = @cliente
    `;
    await pool.request().input('cliente', sql.VarChar, cliente).query(insertQuery);

    res.status(200).send('Cliente insertado correctamente');
  } catch (err) {
    console.error('Error al insertar cliente:', err);
    res.status(500).send('Error al insertar cliente');
  }
});

// Replicar un cliente entre compañías

router.post('/replicar', async (req, res) => {
  const { origen, destino, cliente } = req.body;

  // Validación de los datos requeridos
  if (!origen || !destino || !cliente) {
    return res.status(400).json({ error: 'Faltan datos: origen, destino o cliente' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si el cliente ya existe en la compañía destino
    const checkQuery = `
      SELECT cliente
      FROM ${destino}.cliente
      WHERE cliente = @cliente
    `;
    const checkResult = await pool.request()
      .input('cliente', sql.VarChar, cliente)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: 'El cliente ya existe en la compañía destino' });
    }

  // 2. Obtener el NIT (contribuyente) asociado al cliente desde el origen
  const contribuyenteQuery = `
  SELECT contribuyente
  FROM ${origen}.cliente
  WHERE cliente = @cliente
`;
const contribuyenteResult = await pool.request()
  .input('cliente', sql.VarChar, cliente)
  .query(contribuyenteQuery);

if (contribuyenteResult.recordset.length === 0) {
  return res.status(404).json({ error: 'Cliente no encontrado en la base origen.' });
}
const contribuyente = contribuyenteResult.recordset[0].contribuyente;

// 3. Verificar si el NIT ya existe en la compañía destino
const nitQuery = `
  SELECT NIT
  FROM ${destino}.nit
  WHERE NIT = @contribuyente
`;
const nitResult = await pool.request()
  .input('contribuyente', sql.VarChar, contribuyente)
  .query(nitQuery);

// 4. Insertar el NIT si no existe
if (nitResult.recordset.length === 0) {
  const insertNitQuery = `
    INSERT INTO ${destino}.nit (NIT, RAZON_SOCIAL, ALIAS, NOTAS, TIPO)
    SELECT NIT, RAZON_SOCIAL, ALIAS, NOTAS, TIPO
    FROM ${origen}.nit
    WHERE NIT = @contribuyente;
  `;
  await pool.request()
    .input('contribuyente', sql.VarChar, contribuyente)
    .query(insertNitQuery);
  console.log(`NIT ${contribuyente} replicado en la compañía ${destino}.`);
}

// 5. Verificar si el cliente ya existe en la compañía destino
const checkClienteQuery = `
  SELECT cliente
  FROM ${destino}.cliente
  WHERE cliente = @cliente
`;
const checkClienteResult = await pool.request()
  .input('cliente', sql.VarChar, cliente)
  .query(checkClienteQuery);

if (checkClienteResult.recordset.length > 0) {
  return res.status(400).json({ error: 'El cliente ya existe en la compañía destino.' });
}


    // Replicar cliente desde la compañía origen a la destino
    const replicateQuery = `
      INSERT INTO ${destino}.cliente (cliente, nombre, alias, contacto, cargo,direccion, dir_emb_default,telefono1, telefono2, fax, contribuyente, fecha_ingreso,MULTIMONEDA, moneda, saldo, saldo_local,
			saldo_dolar, saldo_credito, saldo_nocargos,limite_credito, exceder_limite, tasa_interes, tasa_interes_mora,fecha_ult_mora ,fecha_ult_mov,condicion_pago, nivel_precio,descuento,moneda_nivel,
			ACEPTA_BACKORDER,PAIS,ZONA,RUTA,VENDEDOR,COBRADOR,ACEPTA_FRACCIONES,ACTIVO,EXENTO_IMPUESTOS,EXENCION_IMP1,EXENCION_IMP2,COBRO_JUDICIAL,CATEGORIA_CLIENTE,CLASE_ABC,DIAS_ABASTECIMIEN,USA_TARJETA,E_MAIL,
			REQUIERE_OC,ES_CORPORACION,REGISTRARDOCSACORP,USAR_DIREMB_CORP,APLICAC_ABIERTAS,VERIF_LIMCRED_CORP,USAR_DESC_CORP,DOC_A_GENERAR,TIENE_CONVENIO,NOTAS,DIAS_PROMED_ATRASO,ASOCOBLIGCONTFACT,USAR_PRECIOS_CORP,
			USAR_EXENCIMP_CORP,AJUSTE_FECHA_COBRO,CLASE_DOCUMENTO,LOCAL,TIPO_CONTRIBUYENTE,ACEPTA_DOC_ELECTRONICO,CONFIRMA_DOC_ELECTRONICO,ACEPTA_DOC_EDI,NOTIFICAR_ERROR_EDI,MOROSO,MODIF_NOMB_EN_FAC,SALDO_TRANS,SALDO_TRANS_LOCAL
			,SALDO_TRANS_DOLAR,PERMITE_DOC_GP,PARTICIPA_FLUJOCAJA,USUARIO_CREACION,DETALLAR_KITS)
      SELECT cliente, nombre, alias, contacto, cargo,direccion, dir_emb_default,telefono1, telefono2, fax, contribuyente, fecha_ingreso,MULTIMONEDA, moneda, saldo, saldo_local,
			saldo_dolar, saldo_credito, saldo_nocargos,limite_credito, exceder_limite, tasa_interes, tasa_interes_mora,fecha_ult_mora ,fecha_ult_mov,condicion_pago, nivel_precio,descuento,moneda_nivel,
			ACEPTA_BACKORDER,PAIS,ZONA,RUTA,VENDEDOR,COBRADOR,ACEPTA_FRACCIONES,ACTIVO,EXENTO_IMPUESTOS,EXENCION_IMP1,EXENCION_IMP2,COBRO_JUDICIAL,CATEGORIA_CLIENTE,CLASE_ABC,DIAS_ABASTECIMIEN,USA_TARJETA,E_MAIL,
			REQUIERE_OC,ES_CORPORACION,REGISTRARDOCSACORP,USAR_DIREMB_CORP,APLICAC_ABIERTAS,VERIF_LIMCRED_CORP,USAR_DESC_CORP,DOC_A_GENERAR,TIENE_CONVENIO,NOTAS,DIAS_PROMED_ATRASO,ASOCOBLIGCONTFACT,USAR_PRECIOS_CORP,
			USAR_EXENCIMP_CORP,AJUSTE_FECHA_COBRO,CLASE_DOCUMENTO,LOCAL,TIPO_CONTRIBUYENTE,ACEPTA_DOC_ELECTRONICO,CONFIRMA_DOC_ELECTRONICO,ACEPTA_DOC_EDI,NOTIFICAR_ERROR_EDI,MOROSO,MODIF_NOMB_EN_FAC,SALDO_TRANS,SALDO_TRANS_LOCAL
			,SALDO_TRANS_DOLAR,PERMITE_DOC_GP,PARTICIPA_FLUJOCAJA,USUARIO_CREACION,DETALLAR_KITS
      FROM ${origen}.cliente
      WHERE cliente = @cliente
    `;
    await pool.request()
      .input('cliente', sql.VarChar, cliente)
      .query(replicateQuery);

    res.status(200).json({ message: 'Cliente replicado correctamente' });
  } catch (err) {
    console.error('Error al replicar cliente:', err);

    // Retornar el error SQL detallado si está disponible
    if (err.originalError && err.originalError.info && err.originalError.info.message) {
      return res.status(500).json({ error: `Error SQL: ${err.originalError.info.message}` });
    }

    res.status(500).json({ error: 'Error interno al replicar cliente' });
  }
});



module.exports = router;
