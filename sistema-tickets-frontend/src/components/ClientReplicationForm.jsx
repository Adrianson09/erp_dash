import React, { useState, useEffect } from "react";
import MessageContainer from "./MessageContainer";

export const ClientReplicationForm = () => {
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState("");
  const [client, setClient] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Cargar compañías y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesResponse = await fetch("http://localhost:3000/api/companias");
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);

        const clientsResponse = await fetch("http://localhost:3000/api/clientes");
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setMessage({ text: "Error al cargar datos", type: "bg-red-600" });
        clearMessageAfterTimeout();
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company || !client) {
      setMessage({ text: "Por favor, selecciona una compañía y un cliente.", type: "bg-red-600" });
      clearMessageAfterTimeout();
      return;
    }

    try {
      // Validar cliente
      const validationResponse = await fetch("http://localhost:3000/api/clientes/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compania: company, cliente: client }),
      });

      const validationData = await validationResponse.json();

      if (validationData.exists) {
        setMessage({ text: "El cliente ya existe en la compañía.", type: "bg-orange-600" });
        clearMessageAfterTimeout();
        return;
      }

      // Replicar cliente
      const replicationResponse = await fetch("http://localhost:3000/api/clientes/replicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origen: "base",
          destino: company,
          cliente: client,
        }),
      });
      

      if (replicationResponse.ok) {
        setMessage({ text: "Cliente replicado correctamente.", type: "bg-green-600" });
      } else {
        setMessage({ text: "Error al replicar el cliente.", type: "bg-red-600" });
      }
    } catch (err) {
      console.error("Error durante la replicación:", err);
      setMessage({ text: "Error durante la replicación.", type: "bg-red-600" });
    } finally {
      clearMessageAfterTimeout();
    }
  };

  const clearMessageAfterTimeout = () => {
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000); // 3 segundos
  };

  return (
    <div className="max-w-md mx-auto bg-gray-200 p-6 rounded-lg shadow-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Replica de Clientes</h1>
      <MessageContainer message={message} />
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="company-client" className="block text-sm font-medium">
            Compañía
          </label>
          <select
            id="company-client"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="block w-full mt-1 p-2 bg-gray-300 border border-gray-600 rounded"
          >
            <option value="">Seleccione una compañía</option>
            {companies.map((comp) => (
              <option key={comp.conjunto} value={comp.conjunto}>
                {comp.conjunto}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="client" className="block text-sm font-medium">
            Cliente
          </label>
          <select
            id="client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="block w-full mt-1 p-2 bg-gray-300 border border-gray-600 rounded"
          >
            <option value="">Seleccione un cliente</option>
            {clients.map((cli) => (
              <option key={cli.cliente} value={cli.cliente}>
                {cli.cliente} - {cli.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#6AAB33] hover:bg-lime-600 text-white font-semibold rounded"
        >
          Ejecutar replicación de cliente
        </button>
      </form>
    </div>
  );
};
