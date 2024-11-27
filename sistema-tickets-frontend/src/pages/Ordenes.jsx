import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Ordenes = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");

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
      .then((data) => {
        setOrders(data);
        setFilteredOrders(data); // Inicializa las órdenes filtradas
      })
      .catch((err) => console.error("Error al obtener órdenes:", err));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = React.useMemo(() => {
    if (!sortConfig.key) return filteredOrders;

    const sorted = [...filteredOrders].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredOrders, sortConfig]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query) {
      setFilteredOrders(orders);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();

    const filtered = orders.filter((order) => {
      return (
        order.NOMBRE_PROVEEDOR?.toLowerCase().includes(lowerCaseQuery) ||
        order.ORDEN_COMPRA?.toLowerCase().includes(lowerCaseQuery) ||
        selectedCompany.toLowerCase().includes(lowerCaseQuery)
      );
    });

    setFilteredOrders(filtered);
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

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por orden de compra o por proveedor..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="p-2 border rounded-md w-full"
        />
      </div>

      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 cursor-pointer" onClick={() => handleSort("ORDEN_COMPRA")}>
              Orden {sortConfig.key === "ORDEN_COMPRA" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("PROVEEDOR")}>
              Proveedor {sortConfig.key === "PROVEEDOR" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("NOMBRE_PROVEEDOR")}>
              Proveedor {sortConfig.key === "NOMBRE_PROVEEDOR" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("MONEDA")}>
              Moneda {sortConfig.key === "MONEDA" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("ESTADO")}>
              ESTADO {sortConfig.key === "ESTADO" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("TOTAL_MERCADERIA")}>
              Total {sortConfig.key === "TOTAL_MERCADERIA" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("FECHA")}>
              Fecha {sortConfig.key === "FECHA" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.length > 0 ? (
            sortedOrders.map((order) => {
              const estadoInfo = estadoMapping[order.ESTADO] || { text: "DESCONOCIDO", color: "text-gray-600" };

              return (
                <tr key={order.ORDEN_COMPRA} className="border-b">
                  <td className="p-2">
                    <Link
                      to={`/dashboard/ordenes/${selectedCompany}/${order.ORDEN_COMPRA}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.ORDEN_COMPRA || "N/A"}
                    </Link>
                  </td>
                  <td className="p-2">{order.PROVEEDOR || "Sin Proveedor"}</td>
                  <td className="p-2">{order.NOMBRE_PROVEEDOR || "Sin Proveedor"}</td>
                  <td className="p-2">{order.MONEDA || "N/A"}</td>
                  <td className={`p-2 ${estadoInfo.color}`}>{estadoInfo.text}</td>
                  <td className="p-2">
  {typeof order.TOTAL_MERCADERIA === "number"
    ? order.TOTAL_MERCADERIA.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "N/A"}
</td>
                  <td className="p-2">
                    {order.FECHA ? new Date(order.FECHA).toLocaleDateString() : "Sin Fecha"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4">
                No hay órdenes disponibles para la compañía seleccionada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
