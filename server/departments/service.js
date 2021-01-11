'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

/**
 * Do like in a user
 */

module.exports.departments = () => {
    console.log('dep')
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM departamentos', {});

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há departamentos'
                });

            return resolve({
                status: 'OK',
                message: 'Lista de departamentos',
                data: rows
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}


module.exports.department = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM departamentos WHERE id_departamento = :id', {
                replacements: {
                    id
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Departamento não encontrado'
                });

            return resolve({
                status: 'OK',
                message: 'Informações do departtamento',
                data: rows
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}