import { useState } from 'react';

function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
    
            console.log('Respuesta del servidor:', data);
    
            if (response.ok) {
                setMessage('Inicio de sesión exitoso');
                setMessageType('success');
                onLogin(data.token);
    
                setTimeout(() => {
                    setMessage(null);
                }, 3000);
            } else {
                console.error('Error en las credenciales:', data.error);
                setMessage('Error en las credenciales: ' + data.error);
                setMessageType('error');
    
                setTimeout(() => {
                    setMessage(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Error en la conexión con el servidor:', error.message);
            setMessage('Error en la conexión con el servidor');
            setMessageType('error');
    
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        }
    };
    

    return (
        <div className="w-full max-w-md mx-auto">
            {message && (
                <div
                    className={`p-4 mb-4 text-white text-center rounded ${
                        messageType === 'success' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-[#00000086]  p-20  shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-center"></h2>
                <img src="/logo.png" alt="Logo" className="h-20  mx-auto" />
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-100">Usuario</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Ingresa tu usuario de dominio"
                        required
                        autoComplete="username"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-100">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Ingresa tu contraseña"
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button
                    type="submit"
                    className="w-32 pt-2 pb-2 mt-4 bg-lime-700  text-white p-2 rounded-lg hover:bg-lime-800 transition-colors"
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
