import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const estadoMapping = {
  A: { text: "BORRADOR", color: "text-red-600" },
  E: { text: "APROBADA", color: "text-green-600" },
  O: { text: "CANCELADA", color: "text-red-600" },
  P: { text: "POR APROBAR", color: "text-red-600" },
  I: { text: "BACKORDER", color: "text-green-600" },
  R: { text: "RECIBIDA", color: "text-green-600" },
  U: { text: "CERRADA", color: "text-orange-600" },
  N: { text: "NO APROBADA", color: "text-red-800" },
};

export const OrderDetails = () => {

  const { company, id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar los detalles de la orden
  useEffect(() => {
    fetch(`http://localhost:3000/api/ordenes/${company}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los datos de la orden");
        return res.json();
      })
      .then((data) => setOrderDetails(data))
      .catch((err) => setError(err.message));
  }, [company, id]);

  // Cargar los detalles del conjunto
  useEffect(() => {
    fetch("http://localhost:3000/api/companias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los datos de la compañía");
        return res.json();
      })
      .then((data) => {
        const selectedCompany = data.find((comp) => comp.conjunto === company);
        setCompanyDetails(selectedCompany);
      })
      .catch((err) => setError(err.message));
  }, [company]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!orderDetails || !companyDetails) return <p>Cargando datos...</p>;

  const estadoInfo = estadoMapping[orderDetails.estado] || { text: "DESCONOCIDO", color: "text-gray-600" };


  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      {/* Botones */}
      <div className="flex justify-between no-print">
        <button
          onClick={() => navigate("/dashboard/ordenes")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Regresar
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white shadow-md p-8 mx-auto max-w-4xl">
        {/* Encabezado */}
            <img src="/logo.jpg" alt="Caribe Hospitality" className="h-40 mb-2 mx-auto" />
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md mb-6">
          <div>
            <p className="text-sm font-bold">{companyDetails.nombre}</p>
            <p className="text-sm">Avenida Escazú</p>
            <p className="text-sm">Teléfono: {companyDetails.telefono}</p>
            <p className="text-sm">NIT: {companyDetails.nit}</p>
            <p className="text-sm">Correo Electrónico: {companyDetails.EMAIL_DOC_ELECTRONICO || 'ND'}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">ORDEN DE COMPRA</p>
            <p className="text-2xl font-extrabold">{orderDetails.orden_compra}</p>
            <p className={`${estadoInfo.color} font-bold text-lg`}>{estadoInfo.text}</p>
              
                              
          </div>
        </div>

        {/* Información General */}
        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(orderDetails.fecha).toLocaleDateString("es-CR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Proveedor:</strong> {orderDetails.proveedor} -{" "}
            {orderDetails.nombre_proveedor}
          </p>
          <p>
            <strong>Contacto:</strong> {orderDetails.contacto_proveedor} 
          </p>
          <p>
            <strong>Correo Electrónico:</strong> {orderDetails.e_mail} 
          </p>
          <p>
            <strong>Teléfono:</strong> {orderDetails.telefono_proveedor}
          </p>
          <p>
            <strong>Facturar a:</strong> {companyDetails.nombre}
          </p>
          <p>
            <strong>Moneda:</strong> {orderDetails.moneda}
          </p>
          
          
        </div>

        {/* Tabla de Líneas */}
        <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="border border-gray-300 p-2">Cantidad</th>
              {/* <th className="border border-gray-300 p-2">Unidad</th> */}
              <th className="border border-gray-300 p-2">Descripción</th>
              <th className="border border-gray-300 p-2">Número de Fase</th>
              <th className="border border-gray-300 p-2">Proyecto</th>
              <th className="border border-gray-300 p-2">Precio Unitario</th>
              <th className="border border-gray-300 p-2">Descuento</th>
              <th className="border border-gray-300 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.lineas.map((line) => (
              <tr key={line.orden_compra_linea}>
                <td className="border border-gray-300 p-2 text-center">
                  {line.cantidad_ordenada}
                </td>
                {/* <td className="border border-gray-300 p-2 text-center">SER</td> */}
                <td className="border border-gray-300 p-2">{line.descripcion_articulo}</td>
                <td className="border border-gray-300 p-2 text-center">{line.fase}</td>
                <td className="border border-gray-300 p-2 text-center">{line.proyecto}</td>
                <td className="border border-gray-300 p-2 text-right">
                  ${line.precio_unitario.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ${line.descuento_linea.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ${(line.cantidad_ordenada * line.precio_unitario).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="text-right mb-6">
          <p className="text-lg">
            <strong>Total Mercadería:</strong> $
            {orderDetails.total_mercaderia.toFixed(2)}
          </p>
          <p className="text-lg">
            <strong>Impuestos:</strong> ${orderDetails.total_impuesto1.toFixed(2)}
          </p>
          <p className="text-lg font-bold">
            <strong>Total:</strong> $
            {(
              orderDetails.total_mercaderia + orderDetails.total_impuesto1
            ).toFixed(2)}
          </p>
        </div>

        {/* Firmas */}
        <div>
          <p className="mb-2">
            <strong>Aprobado por:</strong>
          </p>
          <div className="grid grid-cols-2 gap-6">
            {orderDetails.aprobadores.map((aprobador) => (
              <div key={aprobador.rowPointer} className="text-center">
                {/* <p>________________________</p> */}
                <p className="font-bold">{aprobador.usuario}</p>
                <p className="text-sm">
                  RowPointer: <em>{aprobador.rowPointer}</em>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
