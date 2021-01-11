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
module.exports.packages = (user, current_page, offset) => {
    return new Promise(async (resolve, reject) => {
        try {

            // INICIO DA LISTAGEM DE USUARIOS
            let sql = `SELECT * FROM packages WHERE status = true ORDER BY price ASC`;
            let [rows, metacards] = await database.query(sql, {});

            if (!rows || rows.length <= 0) {
              return resolve({
                  status: 'WARN',
                  message: 'Não há usuários.',
                  data: {}
              });
            } else {
              return resolve({
                  status: 'OK',
                  message: 'Pacotes encontrados.',
                  data: rows

              });
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
