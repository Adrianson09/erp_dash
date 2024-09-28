function Dashboard({ onLogout }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Bienvenido al Dashboard</h1>
            <button
                className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
                onClick={onLogout}
            >
                Cerrar Sesión
            </button>
        </div>
    );
}

export default Dashboard;
