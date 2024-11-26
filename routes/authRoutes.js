const express = require('express');
const router = express.Router();
const ad = require('../config/ldapConfig'); // Configuración de Active Directory
const jwt = require('jsonwebtoken');

// Ruta de autenticación
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Se requieren nombre de usuario y contraseña' });
    }

    ad.authenticate(`${username}@caribehospitality.com`, password, (err, auth) => {
        if (err) {
            console.error('Error en autenticación:', err.message);
            return res.status(500).json({ error: 'Error interno durante la autenticación' });
        }

        if (auth) {
            // Generar el token JWT
            const token = jwt.sign(
                { username: `${username}@caribehospitality.com` },
                process.env.SECRET_KEY,
                { expiresIn: '1h' } // Token expira en 1 hora
            );

            return res.status(200).json({
                message: 'Autenticación exitosa',
                username: `${username}@caribehospitality.com`,
                token: token, // Incluir el token en la respuesta
            });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    });
});

module.exports = router;
