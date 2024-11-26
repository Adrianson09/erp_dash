import React, { useState } from 'react';

export const DeleteUsersButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleDelete = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/eliminar-registros', { method: 'DELETE' });
      if (response.ok) {
        setMessage({ text: 'Todos los usuarios ya pueden conectarse.', type: 'bg-green-600' });
      } else {
        setMessage({ text: 'Error al eliminar los registros.', type: 'bg-red-600' });
      }
    } catch (err) {
      console.error('Error al eliminar los registros:', err);
      setMessage({ text: 'Error al eliminar los registros.', type: 'bg-red-600' });
    } finally {
      setIsModalOpen(false);
      clearMessageAfterTimeout();
    }
  };

  const clearMessageAfterTimeout = () => {
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000); // 3 segundos
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2 px-4 bg-[#6AAB33] hover:bg-lime-600 text-white font-semibold rounded shadow-md"
      >
        Limpiar Usuarios Conectados
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 shadow-md">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirmar acción</h2>
            <p className="mb-4">¿Estás seguro de que quieres limpiar todos los usuarios conectados?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message.text && (
        <div
          className={`fixed top-0 left-0 right-0 text-center p-4 ${message.type} text-white z-50 shadow-md`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
