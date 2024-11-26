import React, { useState, useEffect } from "react";
import MessageContainer from "./MessageContainer";

export const ProviderReplicationForm = () => {
  const [companies, setCompanies] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const companiesResponse = await fetch("http://localhost:3000/api/companias");
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);

        const providersResponse = await fetch("http://localhost:3000/api/proveedores");
        const providersData = await providersResponse.json();
        setProviders(providersData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setMessage({ text: "Error al cargar datos", type: "bg-red-600" });
        clearMessageAfterTimeout();
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompany || !selectedProvider) {
      setMessage({ text: "Por favor, selecciona una compañía y un proveedor.", type: "bg-red-600" });
      clearMessageAfterTimeout();
      return;
    }

    try {
      // Validar proveedor
      const validarResponse = await fetch("http://localhost:3000/api/proveedores/validar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ compania: selectedCompany, proveedor: selectedProvider }),
      });

      const validarData = await validarResponse.json();
      if (validarData.exists) {
        setMessage({ text: "El proveedor ya existe en la compañía.", type: "bg-orange-600" });
        clearMessageAfterTimeout();
        return;
      }

      // Replicar proveedor
      const replicarResponse = await fetch("http://localhost:3000/api/proveedores/replicar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origen: "base",
          destino: selectedCompany,
          proveedor: selectedProvider,
        }),
      });

      if (replicarResponse.ok) {
        setMessage({ text: "Proveedor replicado correctamente.", type: "bg-green-600" });
      } else {
        setMessage({ text: "Error al replicar proveedor.", type: "bg-red-600" });
      }
    } catch (err) {
      console.error("Error al replicar proveedor:", err);
      setMessage({ text: "Error al replicar proveedor.", type: "bg-red-600" });
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
    <div className="max-w-md mx-auto bg-gray-200 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Replica de Proveedores</h2>
      <MessageContainer message={message} />
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="company" className="block text-sm font-medium">
            Compañía
          </label>
          <select
            id="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-300 border border-gray-600 rounded"
          >
            <option value="">Seleccione una compañía</option>
            {companies.map((company) => (
              <option key={company.conjunto} value={company.conjunto}>
                {company.conjunto}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="provider" className="block text-sm font-medium">
            Proveedor
          </label>
          <select
            id="provider"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-300 border border-gray-600 rounded"
          >
            <option value="">Seleccione un proveedor</option>
            {providers.map((provider) => (
              <option key={provider.proveedor} value={provider.proveedor}>
                {provider.proveedor} - {provider.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#6AAB33] hover:bg-lime-600 text-white font-semibold rounded"
        >
          Ejecutar replicación
        </button>
      </form>
    </div>
  );
};
