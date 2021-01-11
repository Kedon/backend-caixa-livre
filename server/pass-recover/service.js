'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')


/**
 * RECOVER USER PASS 
 */
module.exports.passwordRecover = (email) => {
    const code = Math.floor(100000 + Math.random() * 900000);

    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO passrecover (code, email ) VALUES (:code, :email)', {
                replacements: {
                    email,
                    code: code
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não foi solicitar nova senha. Tente novamente mais tarde!'
                });

            return resolve({
                email: email,
                code: code
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



module.exports.verifyPass = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM passrecover WHERE email = :email', {
                replacements: {
                    email
                }
            });

            /**
             * Se retornar resultado, quer dizer que usuário foi curtido, senão não
             */

            if (!rows || rows.length <= 0)
                return resolve({});
            let pass = rows.map((r) => {
                return {
                    email: r.email,
                }
            })
            return resolve(pass[0]);

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}



/**
 * UPDATE A HOBBIE
 */
module.exports.updatePass = (email) => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE passrecover SET code = :code WHERE email = :email', {
                replacements: {
                    email,
                    code: code
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar codigo.'
                });

            return resolve({
                email: email,
                code: code
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


module.exports.confirmPass = (email, code) => {
    console.log(email)
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM passrecover WHERE email = :email and code = :code', {
                replacements: {
                    email,
                    code
                }
            });

            /**
             * Se retornar resultado, quer dizer que usuário foi curtido, senão não
             */

            if (!rows || rows.length <= 0) {
                return resolve(false);
            } else {
                return resolve(true);
            }
        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}



/**
 * REMOVE Pass recover code
 */
module.exports.removeCode = (code) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('DELETE FROM passrecover WHERE code =:code', {
                replacements: {
                    code
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao excluir hobbie.'
            });

        return resolve({
            status: 'OK',
            message: 'Codigo removido com sucesso',
            data: {
                code: code
            }
        });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}
