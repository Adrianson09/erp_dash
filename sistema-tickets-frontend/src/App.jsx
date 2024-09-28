import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import Tickets from './pages/Tickets';
import NuevoTicket from './pages/NuevoTicket';
import Reportes from './pages/Reportes';

function App() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={!token ? <LoginPage onLogin={setToken} /> : <Navigate to="/dashboard/tickets" />} />

                {/* Rutas protegidas del dashboard */}
                {token && (
                    <Route path="/dashboard" element={<DashboardLayout onLogout={handleLogout} />}>
                        <Route path="tickets" element={<Tickets />} />
                        <Route path="nuevo-ticket" element={<NuevoTicket />} />
                        <Route path="reportes" element={<Reportes />} />
                    </Route>
                )}
                
                {/* Si no hay token, redirige al login */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
