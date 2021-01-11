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

module.exports.promotions = (admin) => {
    const baseUrl = `https://static.caixalivre.net/images/webp/`
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    //'SELECT a.*, JSON_ARRAYAGG(JSON_OBJECT("id_departamento", d.id_departamento, "departamento", d.departamento, "slug", d.slug)) as departments FROM Prd_Area a LEFT JOIN Prd_Departamentos as d ON (d.area = a.id) WHERE a.id in (SELECT area FROM Prd_Produtos_Local WHERE admin = :admin AND status = 1) GROUP BY a.id ORDER BY `a`.`order` ASC ', 
                    `SELECT c.* ,
                        JSON_ARRAYAGG(JSON_OBJECT("ean", p.ean, "regular_price", p.regular_price, "promo_price", p.promo_price, "produto", o.produto, "imagem", o.imagem, "secao", o.area, "secao_id", o.section_id)) as products
                        FROM Prm_Campanhas c
                        LEFT JOIN Prm_Campanhas_Produtos p USING (uuid)
                        LEFT JOIN ( SELECT produto, ean, imagem, a.area, a.id AS section_id FROM Prd_Produtos p
                                        LEFT JOIN Prd_Produtos_Local l USING (ean)
                                        LEFT JOIN Prd_Area a ON (a.id = p.area)
                                        WHERE l.admin = ${admin}
                                        AND l.status = 1
                             ) o ON (p.ean = o.ean)
                        WHERE (c.start <= Now() AND c.end >=  Now() ) AND c.admin = :admin AND c.status = 1 AND c.home = 1 LIMIT 5`, 
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