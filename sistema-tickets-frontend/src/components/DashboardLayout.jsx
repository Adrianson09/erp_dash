import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

function DashboardLayout({ onLogout }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Menú superior */}
            <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-20 mr-4" />
                    <nav className="space-x-4">
                        <Link to="/dashboard/replicas" className="hover:text-gray-300">Replicas</Link>
                        <Link to="/dashboard/nuevo-ticket" className="hover:text-gray-300">Nuevo Ticket</Link>
                        <Link to="/dashboard/reportes" className="hover:text-gray-300">Reportes</Link>
                        <Link to="/dashboard/ordenes" className="hover:text-gray-300">Ordenes</Link>
                    </nav>
                </div>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded">
                    Cerrar Sesión
                </button>
            </header>

            {/* Contenido dinámico (el resto de las páginas) */}
            <motion.main
                className="flex-grow p-8 bg-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Outlet />
            </motion.main>
        </div>
    );
}

export default DashboardLayout;
