import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

function LoginPage({ onLogin }) {
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    const handleLogin = (jwt) => {
        setToken(jwt);
        localStorage.setItem('token', jwt);
        onLogin(jwt);
        navigate('/dashboard/tickets');  // Redirigir al Dashboard inmediatamente
    };

    return (
        <div  className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/hyatt.webp')" }} // Aplica la imagen de fondo>
        >
            {!token ? (
                <LoginForm onLogin={handleLogin} />
            ) : (
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">¡Bienvenido!</h1>
                    <p className="text-white">Ya has iniciado sesión.</p>
                </div>
            )}
        </div>
    );
}

export default LoginPage;
