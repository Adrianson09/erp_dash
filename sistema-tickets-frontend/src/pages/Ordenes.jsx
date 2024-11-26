import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Ordenes = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Obtener compañías desde el backend
    fetch("http://localhost:3000/api/companias")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error("Error al obtener compañías:", err));
  }, []);

  const handleCompanyChange = (company) => {
    setSelectedCompany(company);
    // Obtener órdenes de la compañía seleccionada
    fetch(`http://localhost:3000/api/ordenes?compania=${company}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error al obtener órdenes:", err));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Listado de compañías</h1>
      <div className="mb-4">
        <label htmlFor="company" className="block text-lg font-semibold">
          Selecciona una compañía:
        </label>
        <select
          id="company"
          className="p-2 border rounded-md w-full"
          onChange={(e) => handleCompanyChange(e.target.value)}
        >
          <option value="">Selecciona...</option>
          {companies.map((company) => (
            <option key={company.conjunto} value={company.conjunto}>
              {company.conjunto}
            </option>
          ))}
        </select>
      </div>
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2">Orden</th>
            <th className="p-2">Proveedor</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.ORDEN_COMPRA} className="border-b">
                <td className="p-2">
                  <Link
                    to={`/dashboard/ordenes/${selectedCompany}/${order.ORDEN_COMPRA}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.ORDEN_COMPRA || "N/A"}
                  </Link>
                </td>
                <td className="p-2">{order.NOMBRE_PROVEEDOR || "Sin Proveedor"}</td>
                <td className="p-2">
                  {order.FECHA ? new Date(order.FECHA).toLocaleDateString() : "Sin Fecha"}
                </td>
                <td className="p-2">
                  {typeof order.TOTAL_MERCADERIA === "number"
                    ? order.TOTAL_MERCADERIA.toFixed(2)
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No hay órdenes disponibles para la compañía seleccionada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
