const ad = require('../config/ldapConfig');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;
    const userPrincipalName = `${username}@caribehospitality.com`;

    ad.authenticate(userPrincipalName, password, (err, auth) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la autenticación', details: err });
        }

        if (auth) {
            // Autenticación exitosa, generar JWT
            const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Autenticación exitosa', token });
        } else {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    });
};
