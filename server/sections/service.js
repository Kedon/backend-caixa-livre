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

module.exports.areas = (admin) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    'SELECT a.*, JSON_ARRAYAGG(JSON_OBJECT("id_departamento", d.id_departamento, "departamento", d.departamento, "slug", d.slug)) as departments FROM Prd_Area a LEFT JOIN Prd_Departamentos as d ON (d.area = a.id) WHERE a.id in (SELECT area FROM Prd_Produtos_Local WHERE admin = :admin AND status = 1) GROUP BY a.id ORDER BY `a`.`order` ASC ', 
                    {
                        replacements: {
                            admin
                        }
                    });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há áreas disponíveis',
                    data: []
                });

            return resolve({
                status: 'OK',
                message: 'Lista de áreas',
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


module.exports.area = (admin, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    'SELECT a.*, JSON_ARRAYAGG(JSON_OBJECT("id_departamento", d.id_departamento, "departamento", d.departamento, "slug", d.slug)) as departments FROM Prd_Area a LEFT JOIN Prd_Departamentos as d ON (d.area = a.id) WHERE a.id in (SELECT area FROM Prd_Produtos_Local WHERE admin = :admin AND status = 1) AND a.id=:id GROUP BY a.id ORDER BY `a`.`order` ASC ', 
                    {
                        replacements: {
                            admin,
                            id
                        }
                    });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há áreas disponíveis',
                    data: []
                });

            return resolve({
                status: 'OK',
                message: 'Lista de áreas',
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

/*"prodducts", JSON_ARRAY(
                                    (SELECT JSON_ARRAYAGG(
                                        JSON_OBJECT('id_produto',id_produto,'produto',produto,'id_departamento',id_departamento)
                                        )   
                                    FROM Prd_Produtos 
                                    WHERE id_departamento = d.id_departamento GROUP BY id_produto ORDER BY id_produto DESC LIMIT 10)
                                  )
                            ) */
module.exports.excerpt = (admin, id) => {
    console.log(`this.excerpt`)
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    `SELECT 
                        a.*, 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                "id_departamento", d.id_departamento, 
                                "departamento", d.departamento, 
                                "slug", d.slug
                            )
                        ) as departments 
                        FROM Prd_Area a 
                            LEFT JOIN Prd_Departamentos as d ON (d.area = a.id)
                            LEFT JOIN (SELECT * FROM Prd_Produtos LIMIT 12) p ON (d.area = p.area)
                            WHERE a.id in (SELECT area FROM Prd_Produtos_Local WHERE admin = :admin AND status = 1) 
                            AND a.id=:id GROUP BY a.id ORDER BY a.order ASC `, 
                    {
                        replacements: {
                            admin,
                            id
                        }
                    });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há áreas disponíveis',
                    data: []
                });

            return resolve({
                status: 'OK',
                message: 'Lista de áreas',
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

module.exports.highlights = (admin) => {
    const baseUrl = `https://emporiosaopaulo.kedon.com.br/single_usr/uid${admin}/images/highlights`
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    'SELECT * FROM Highlights WHERE admin = :admin ORDER BY ord ', 
                    {
                        replacements: {
                            admin
                        }
                    });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há áreas disponíveis',
                    data: []
                });

            return resolve({
                status: 'OK',
                message: 'Lista de áreas',
                data: rows.map( m => {
                    const paths = JSON.parse(m.paths)
                    return {
                        id: m.id,
                        ord: m.ord,
                        title: m.title,
                        basePath: baseUrl,
                        image: m.image,
                        paths: paths.map( m => {
                            return {
                                path: m.path,
                                title: m.title.replace(/\r?\n|\r/g, "").trim(),
                                departmentId: m.path.replace(/\D/g,'')
                            }
                        }),
                        created_at: m.created_at,
                        updated_at: m.updated_at
                    }
                })
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