const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
// const bodyParser = require('body-parser');
// const { poolPromise } = require('./dbConfig');

// Importar rutas
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación
const proveedoresRoutes = require('./routes/proveedores');
const clientesRoutes = require('./routes/clientes');
const nitRoutes = require('./routes/nit');

const eliminarRegistrosRoutes = require('./routes/eliminarRegistros');
const listadoOrdenesRouter = require('./routes/listadoOrdenes'); // Listado de órdenes
const detallesOrdenRouter = require('./routes/detallesOrden'); // Detalles de órdenes
const companiasRouter = require('./routes/companias'); // Compañías

// Configurar la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Soporte para cuerpos JSON
app.use(morgan('dev')); // Registro de solicitudes HTTP

// Rutas
app.use('/auth', authRoutes); // Autenticación
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/nit', nitRoutes);
app.use('/api/eliminar-registros', eliminarRegistrosRoutes);
app.use('/api', companiasRouter); // Compañías
app.use('/api', listadoOrdenesRouter); // Listado de órdenes
app.use('/api', detallesOrdenRouter); // Detalles de órdenes

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error capturado:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Rutas disponibles:');
    console.log('  POST  /auth/login            - Iniciar sesión');
    console.log('  GET   /api/companias         - Listar compañías');
    console.log('  GET   /api/ordenes           - Listar órdenes (requiere query "compania")');
    console.log('  GET   /api/ordenes/:compania/:id - Detalles de una orden específica');
});
