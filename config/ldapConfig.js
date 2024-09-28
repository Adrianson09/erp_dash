const ActiveDirectory = require('activedirectory2');
require('dotenv').config();

const config = {
    url: process.env.LDAP_URL,
    baseDN: process.env.LDAP_BASE_DN,
    username: process.env.LDAP_ADMIN_USER,
    password: process.env.LDAP_ADMIN_PASS,
};

const ad = new ActiveDirectory(config);

module.exports = ad;
