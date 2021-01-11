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

module.exports.categories = () => {
    console.log('dep')
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT categorias.*, departamentos.* FROM categorias LEFT JOIN departamentos USING (id_departamento)', {});

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há categorias'
                });

            return resolve({
                status: 'OK',
                message: 'Lista de categorias',
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


module.exports.category = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT categorias.*, departamentos.* FROM categorias LEFT JOIN departamentos USING (id_departamento) WHERE id_categoria = :id', {
                replacements: {
                    id
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Categoria não encontrada'
                });

            return resolve({
                status: 'OK',
                message: 'Informações da categoria',
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

module.exports.categoryDepartments = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT categorias.*, departamentos.* FROM categorias LEFT JOIN departamentos USING (id_departamento) WHERE id_departamento = :id', {
                replacements: {
                    id
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há categorias'
                });

            return resolve({
                status: 'OK',
                message: 'Lista de categorias',
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