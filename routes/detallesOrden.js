const express = require('express');
const { poolPromise, sql } = require('../config/dbConfig');
const router = express.Router();

// Ruta para obtener los detalles de una orden específica
router.get('/ordenes/:compania/:orden_compra', async (req, res) => {
  try {
    const { compania, orden_compra } = req.params;

    if (!compania || !orden_compra) {
      return res.status(400).json({ error: 'Los parámetros "compania" y "orden_compra" son obligatorios.' });
    }

    const pool = await poolPromise;

    // Realizar la consulta
    const result = await pool
      .request()
      .input('orden_compra', sql.VarChar, orden_compra)
      .query(`
        SELECT 
          oco.orden_compra,
          oco.DEPARTAMENTO,
          oco.proveedor,
          pro.nombre AS nombre_proveedor,
          pro.telefono1 AS telefono_proveedor,
          pro.pais AS pais_proveedor,
          pro.e_mail,
          oco.condicion_pago,
          oco.MONEDA,
          oco.FECHA,
          oco.PRIORIDAD,
          lin.orden_compra_linea,
          lin.ARTICULO,
          lin.DESCRIPCION AS descripcion_articulo,
          lin.CANTIDAD_ORDENADA,
          lin.PRECIO_UNITARIO,
          lin.MONTO_DESCUENTO AS descuento_linea,
          lin.FASE,
          lin.PROYECTO,
          pry.descripcion as NOMBRE_PROYECTO,
          oco.TOTAL_MERCADERIA,
          oco.MONTO_DESCUENTO AS descuento_total,
          oco.MONTO_FLETE,
          oco.MONTO_SEGURO,
          oco.MONTO_DOCUMENTACIO,
          oco.MONTO_ANTICIPO,
          oco.TOTAL_IMPUESTO1,
          oco.RUBRO4,
          oco.OBSERVACIONES,
          oco.ESTADO,
          lin.CENTRO_COSTO,
          lin.CUENTA_CONTABLE,
          pro.CONTACTO AS contacto_proveedor,
          apr.USUARIO AS usuario_aprobador,
          apr.FECHA_APROB AS fecha_aprobacion,
          apr.RowPointer
        FROM ${compania}.ORDEN_COMPRA oco
        LEFT JOIN ${compania}.PROVEEDOR pro ON oco.proveedor = pro.proveedor
        LEFT JOIN ${compania}.ORDEN_COMPRA_LINEA lin ON oco.orden_compra = lin.orden_compra
        LEFT JOIN ${compania}.USUARIOS_APROB_OC apr ON apr.orden_compra = oco.orden_compra
        left join ${compania}.PROYECTO_PY pry on pry.CENTRO_COSTO = lin.PROYECTO
        WHERE oco.orden_compra = @orden_compra
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'No se encontró la orden de compra.' });
    }

    const generalData = result.recordset[0];

    // Eliminar duplicados en aprobadores
    const aprobadores = Array.from(
      new Map(
        result.recordset
          .filter((row) => row.usuario_aprobador)
          .map((row) => [row.RowPointer, {
            usuario: row.usuario_aprobador,
            fecha_aprobacion: row.fecha_aprobacion,
            rowPointer: row.RowPointer,
          }])
      ).values()
    );

    // Eliminar duplicados en líneas
    const lineas = Array.from(
      new Map(
        result.recordset
          .filter((row) => row.orden_compra_linea)
          .map((row) => [`${row.orden_compra_linea}-${row.ARTICULO}`, {
            orden_compra_linea: row.orden_compra_linea,
            articulo: row.ARTICULO,
            descripcion_articulo: row.descripcion_articulo,
            cantidad_ordenada: row.CANTIDAD_ORDENADA,
            precio_unitario: row.PRECIO_UNITARIO,
            descuento_linea: row.descuento_linea,
            fase: row.FASE,
            proyecto: row.PROYECTO,
            NOMBRE_PROYECTO: row.NOMBRE_PROYECTO,
            centro_costo: row.CENTRO_COSTO,
            cuenta_contable: row.CUENTA_CONTABLE,
          }])
      ).values()
    );

    // Construir la respuesta final
    const orderDetails = {
      orden_compra: generalData.orden_compra,
      departamento: generalData.DEPARTAMENTO,
      proveedor: generalData.proveedor,
      nombre_proveedor: generalData.nombre_proveedor,
      telefono_proveedor: generalData.telefono_proveedor,
      pais_proveedor: generalData.pais_proveedor,
      e_mail: generalData.e_mail,
      condicion_pago: generalData.condicion_pago,
      moneda: generalData.MONEDA,
      fecha: generalData.FECHA,
      prioridad: generalData.PRIORIDAD,
      total_mercaderia: generalData.TOTAL_MERCADERIA,
      descuento_total: generalData.descuento_total,
      monto_flete: generalData.MONTO_FLETE,
      monto_seguro: generalData.MONTO_SEGURO,
      monto_documentacion: generalData.MONTO_DOCUMENTACIO,
      monto_anticipo: generalData.MONTO_ANTICIPO,
      total_impuesto1: generalData.TOTAL_IMPUESTO1,
      rubro4: generalData.RUBRO4,
      observaciones: generalData.OBSERVACIONES,
      estado: generalData.ESTADO,
      contacto_proveedor: generalData.contacto_proveedor,
      aprobadores,
      lineas,
    };

    res.status(200).json(orderDetails);
  } catch (err) {
    console.error('Error al obtener los detalles de la orden:', err.message);
    res.status(500).json({ error: 'Error interno al obtener los detalles de la orden.' });
  }
});

module.exports = router;
