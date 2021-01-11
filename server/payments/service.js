'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')


/**
 * LIST USERS IN THE TIMELINE
 */
module.exports.payment = (userId, packageId, price, time, timeType, level) => {

    const packageStart = moment().format('YYYY-MM-DD HH:mm:ss');
    const packageEnd = moment().add(Number(time), timeType).format('YYYY-MM-DD HH:mm:ss');
    const gateway = 'mercadopago';
    const status = 'pending';
    let orderId = uuidv1();
    return new Promise(async (resolve, reject) => {
        try {

            // INICIO DA LISTAGEM DE USUARIOS
            let sql = `INSERT INTO userPackages (packageId, userId, packageStart, packageEnd, price, gateway, status, orderId, level) VALUES (:packageId, :userId, :packageStart, :packageEnd, :price, :gateway, :status, :orderId, :level)`;
            let [rows, metadata] = await database.query(sql, {
              replacements: {
                packageId,
                userId,
                packageStart,
                packageEnd,
                price,
                gateway,
                status,
                orderId,
                level
              }
            });

            console.log(metadata)
            console.log(metadata)

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao adicionar pedido'
                });

            return resolve({
                status: 'OK',
                message: 'Pedido adicionado com sucesso',
                created: true,
                packageId: packageId,
                orderId: orderId,
                inserted: rows,
                packages: {
                  start: packageStart,
                  end: packageEnd,
                  level: level
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

module.exports.updatePayment = ( userId, status, collector_id, orderId, gateway_id, id ) => {
    return new Promise(async (resolve, reject) => {
        try {
            // INICIO DA LISTAGEM DE USUARIOS
            let sql = `UPDATE userPackages SET status = :status, collector_id = :collector_id, gateway_id = :gateway_id WHERE id = :id AND orderId = :orderId AND userId = :userId `;
            let [rows, metadata] = await database.query(sql, {
              replacements: {
                status,
                collector_id,
                gateway_id,
                id,
                orderId,
                userId
              }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao criar estatística nessa data'
                });

            return resolve({
                status: 'OK',
                message: 'Pedido atualizado com sucesso com sucesso',
                status: status
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
