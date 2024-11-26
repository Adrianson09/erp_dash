const ActiveDirectory = require('activedirectory2');
require('dotenv').config();

// Configuración del Active Directory
const config = {
  url: process.env.LDAP_URL,
  baseDN: process.env.LDAP_BASE_DN,
  username: process.env.LDAP_ADMIN_USER,
  password: process.env.LDAP_ADMIN_PASS,
};

// Validar configuración del LDAP
if (!config.url || !config.baseDN || !config.username || !config.password) {
  console.error('Error: Configuración de LDAP incompleta. Verifica el archivo .env');
  throw new Error('No se puede configurar Active Directory debido a parámetros faltantes.');
}

const ad = new ActiveDirectory(config);

console.log('Configuración de Active Directory cargada correctamente');

module.exports = ad;
