'use strict';

// const accessData = {
//     databaseName: 'LAWAPP',
//     user: 'root',
//     pass: 'root',
//     host: 'localhost'
// }

// const accessData = {
//     databaseName: 'mvcarvalhocom_lawapp',
//     user: 'mvcarvalhocom_lawappuser',
//     pass: '123456',
//     host: 'mvcarvalho.com.br'
// }

/*const accessData = {
    databaseName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
}*/

/*const accessData = {
    databaseName: 'inovador',
    user: 'root',
    pass: 'Vdf78706400',
    host: 'localhost',
    port: '3306',
}*/

const accessData = {
    databaseName: 'emporios_store',
    user: 'admin',
    pass: '12345678',
    host: 'caixalivreemporio.cplntnesocg6.us-east-2.rds.amazonaws.com',
    port: '3306',
}


const Sequelize = require('sequelize');
const sequelize = new Sequelize(accessData.databaseName, accessData.user, accessData.pass, {
    host: accessData.host,
    port: accessData.port,
    dialect: 'mysql',
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;
