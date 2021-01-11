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
module.exports.appAds = (type) => {

    return new Promise(async (resolve, reject) => {
        try {

            // INICIO DA LISTAGEM DE USUARIOS
            let sql = `SELECT * FROM appAds WHERE status = true AND type = :type`;
            let [ads, metacards] = await database.query(sql, {
              replacements: {
                type
              }
            });

            if (!ads || ads.length <= 0) {
              console.log('Nada a exibir')
              return resolve({
                  status: 'WARN',
                  message: 'Não há usuários.',
                  data: {}
              });
            } else {
              return resolve({
                  status: 'OK',
                  message: 'Anúncios encontrados.',
                  data: ads

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
