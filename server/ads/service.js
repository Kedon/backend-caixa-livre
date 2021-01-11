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

module.exports.ads = (admin) => {
    const baseUrl = `https://emporiosaopaulo.kedon.com.br/single_usr/uid${admin}/images/banners/`
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    //'SELECT a.*, JSON_ARRAYAGG(JSON_OBJECT("id_departamento", d.id_departamento, "departamento", d.departamento, "slug", d.slug)) as departments FROM Prd_Area a LEFT JOIN Prd_Departamentos as d ON (d.area = a.id) WHERE a.id in (SELECT area FROM Prd_Produtos_Local WHERE admin = :admin AND status = 1) GROUP BY a.id ORDER BY `a`.`order` ASC ', 
                    `SELECT b.*, i.id, i.arquivo, i.tamanho FROM Banners b 
                        LEFT JOIN _Imagens i ON (i.token = b.uuid)
                        WHERE i.tamanho='mobile' AND b.admin = :admin AND b.status = 1 AND (b.position = 'slider' OR b.position = 'destaque_1' OR b.position = 'destaque_2' OR b.position = 'destaque_3' OR b.position = 'destaque_4' OR b.position = 'home_1' OR b.position = 'highlight_bottom') AND (start <= Now() AND b.end >= Now() ) ORDER BY b.id ASC`, 
                    {
                        replacements: {
                            admin
                        }
                    });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há banners disponíveis',
                    data: []
                });

            return resolve({
                status: 'OK',
                message: 'Lista de banners',
                basePath: baseUrl,
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