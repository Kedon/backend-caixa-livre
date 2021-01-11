'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

/**
 * CREATE NEW HOBBIE
 */
module.exports.rateUser = (senderUserId, receiverUserId, type, ratingValue ) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO ratings (senderUserId, receiverUserId, type, ratingValue ) VALUES (:senderUserId, :receiverUserId, :type, :ratingValue )', {
                replacements: {
                    senderUserId,
                    receiverUserId,
                    type: type ? type : 'PRE',
                    ratingValue
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao avaliar usuário.'
                });

            return resolve({
                status: 'OK',
                message: 'Usuário avaliado com sucesso.',
                data: {
                    senderUserId: senderUserId,
                    receiverUserId: receiverUserId,
                    type: type,
                    ratingValue: ratingValue,
                }
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

module.exports.verifyRate = (receiverUserId, loggeUserId, type) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM ratings WHERE receiverUserId = :receiverUserId AND senderUserId = :loggeUserId AND type = :type', {
                replacements: {
                    receiverUserId, loggeUserId, type
                }
            });

            /**
             * If result mean user already have rate given user
             */
            if (rows && rows.length > 0 ) {
                return resolve(true);
            } else {
                return resolve(false);
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

module.exports.ratingsReceived = (loggedUserId, type) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = 'SELECT * FROM ratings WHERE (receiverUserId = :loggedUserId )';

            if(type && type !==null && type !== '' && (type === 'PRE' || type === 'POS')) {
                query += ' AND type = :type'
            }
            let [rows, metadata] = await database.query(query, {
                replacements: {
                    loggedUserId,
                    type: type ? type : null
                }
            });

           if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Usuário não avaliado',
                    data: {
                        ratings: []
                    }
                });
            let ratings = rows.map((r) => {
                return r;
            })

            return resolve({
                status: 'OK',
                message: 'Usuário avaliado.',
                data: {
                    ratings
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

module.exports.ratingsSubmitted = (loggedUserId, type) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = 'SELECT * FROM ratings WHERE (senderUserId = :loggedUserId )';

            if(type && type !==null && type !== '' && (type === 'PRE' || type === 'POS')) {
                query += ' AND type = :type'
            }

            let [rows, metadata] = await database.query(query, {
                replacements: {
                    loggedUserId,
                    type: type ? type : null
                }
            });

           if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Você não avaiou ninguém',
                    data: {
                        ratings: []
                    }
                });
            let ratings = rows.map((r) => {
                return r;
            })

            return resolve({
                status: 'OK',
                message: 'Suas avaliações.',
                data: {
                    ratings
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