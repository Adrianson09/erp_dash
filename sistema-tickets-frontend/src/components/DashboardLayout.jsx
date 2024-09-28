import { Link, Outlet } from 'react-router-dom';

function DashboardLayout({ onLogout }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Menú superior */}
            <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-20 mr-4" />
                    <nav className="space-x-4">
                        <Link to="/dashboard/tickets" className="hover:text-gray-300">Tickets</Link>
                        <Link to="/dashboard/nuevo-ticket" className="hover:text-gray-300">Nuevo Ticket</Link>
                        <Link to="/dashboard/reportes" className="hover:text-gray-300">Reportes</Link>
                    </nav>
                </div>

                {/* Botón de cerrar sesión */}
                <button
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                >
                    Cerrar Sesión
                </button>
            </header>

            {/* Contenido dinámico (el resto de las páginas) */}
            <main className="flex-grow p-8 bg-gray-100">
                <Outlet /> {/* Esto permite que las rutas hijas se rendericen aquí */}
            </main>
        </div>
    );
}

export default DashboardLayout;
