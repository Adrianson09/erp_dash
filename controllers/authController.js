const ad = require('../config/ldapConfig');
const jwt = require('jsonwebtoken');

// Controlador para manejar el inicio de sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren el nombre de usuario y la contraseña' });
    }

    // Construir el nombre principal del usuario
    const userPrincipalName = `${username}@caribehospitality.com`;

    // Autenticar con Active Directory
    ad.authenticate(userPrincipalName, password, (err, auth) => {
        if (err) {
            console.error('Error en la autenticación:', err.message);
            return res.status(500).json({ error: 'Error en el servidor durante la autenticación' });
        }

        if (auth) {
            // Generar el token JWT
            const token = jwt.sign(
                { username }, // Datos a incluir en el payload
                process.env.SECRET_KEY, // Clave secreta
                { expiresIn: '1h' } // Configuración de expiración
            );

            // Enviar respuesta con token
            return res.status(200).json({ 
                message: 'Autenticación exitosa', 
                token 
            });
        } else {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    });
};
