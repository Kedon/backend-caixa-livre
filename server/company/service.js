'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

/**
 * CREATE NEW COMPANY
 */

module.exports.createCompany = (name, address, number,district, lng, lat, description, status) => {
    let companyId = uuidv1();
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO company(companyId, name, address, number,district, lng, lat, description, status) VALUES (:companyId, :name, :address, :number, :district, :lng, :lat, :description, :status)', {
                replacements: {
                    companyId,
                    name,
                    address,
                    number,
                    district,
                    status: status ? true : false,
                    description: description? description : null,
                    lng: lng? lng : null,
                    lat: lat? lat : null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar empresa.'
                });

            return resolve({
                status: 'OK',
                message: 'Empresa salva com sucesso.',
                data: {
                    company: name
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


/**
 * UPDATE A COMPANY
 */
module.exports.updateCompany = (companyId, name, address, number,district, lng, lat, description, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE company SET name = :name, address = :address, number = :number, district = :district, lng = :lng, lat = :lat, description = :description , status = :status  WHERE companyId = :companyId', {
                replacements: {
                    companyId,
                    name,
                    address,
                    number,
                    district,
                    lng: lng? lng: null,
                    lat: lat ? lat : null,
                    description: description ? description : null,
                    status
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar empresa.'
                });

            return resolve({
                status: 'OK',
                message: 'Empresa atualizada com sucesso.',
                data: {
                    company: name
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



/**
 * UPDATE A USER
 */
module.exports.changeCompanyStatus = (companyId, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE company SET status =:status  WHERE companyId = :companyId', {
                replacements: {
                    companyId,
                    status
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar status da empresa.'
                });

            return resolve({
                status: 'OK',
                message: 'Status da empresa atualizado com sucesso.',
                data: {
                    status: status
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

module.exports.listCompanies = (companyId, createdStart, createdEnd, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM company WHERE 1 =1`;
            let order = ' ORDER BY company.createdAt ASC';
            let replacements = {};

            if (companyId && companyId !== null) {
                sql += ` AND company.companyId = :companyId`;
                replacements.companyId = companyId;
            }
            if( createdStart && createdEnd && createdStart !== null && createdEnd !== null) {
                sql += ` AND company.createdAt BETWEEN :createdStart AND :createdEnd`;
                replacements.createdStart = createdStart;
                replacements.createdEnd = createdEnd;
            }
            if(status && status !== null) {
                sql += ` AND company.status = :status`;
                replacements.status = status
            }


            console.log(sql)
            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Empresas não localizadas.',
                    data: {
                        companies: []
                    }
                });

            let companies = rows

            return resolve({
                status: 'OK',
                message: 'Empresas localizadas.',
                data: {
                    companies
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


module.exports.verifyCompany = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM company WHERE companyId = :companyId AND status = true', {
                replacements: {
                    companyId
                }
            });
            if (!rows || rows.length <= 0)
            return resolve({
                status: 'WARN',
                message: 'Empresa não encontrada ou inativa',
                data: null
            });

            let company = rows.map((r) => {
                return r;
            })

        return resolve({
            status: 'OK',
            message: 'Empresa encontrada',
            data: company
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

module.exports.checkins = (userId, page, offset) => {
    let per_page = 3;
    offset = parseInt(offset);

    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT
            company.companyId,
        	  company.name as companyName,
        	  company.address,
        	  company.logo,
        	  company.lat,
        	  company.lng,
              c.coupons,
              d.checkins,
        	  (ST_Distance_Sphere(
        			point(company.lat, company.lng),
        			point(logged.latitude, logged.longitude)
        		  )/1000
        		) as distance
        	FROM company
        	LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = :userId) as logged ON (1=1)
          LEFT JOIN (SELECT count(*) as coupons, companyId FROM coupon WHERE validity >= NOW() AND status = 'ACTIVATED' GROUP BY companyId) as c ON (company.companyId = c.companyId)
          LEFT JOIN (SELECT count(*) as checkins, companyId FROM checkins WHERE checkoutAt IS NULL AND userId <> :userId GROUP BY companyId) as d ON (company.companyId = d.companyId)
          WHERE company.status = true
          HAVING distance <= 15
          ORDER BY distance ASC
          LIMIT ${offset}, ${per_page}
          `;
            let [rows, metadata] = await database.query(sql, {
              replacements: {
                  userId,
                  userId
              }
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Empresas não localizadas.',
                    data: {
                        companies: []
                    },
                    pagination: {
                      page: parseInt(page),
                      //next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                      next_page: null,
                      offset: offset + rows.length,
                      per_page: per_page,
                      //total: pagination[0].total,
                    }

                });

            let companies = rows
            console.log(rows.length)
            return resolve({
                status: 'OK',
                message: 'Empresas localizadas.',
                data: {
                    companies
                },
                pagination: {
                  page: parseInt(page),
                  //next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                  next_page: parseInt(page) + 1,
                  offset: offset + rows.length,
                  per_page: per_page,
                  //total: pagination[0].total,
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

module.exports.checkin = (userId, companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT
            company.companyId,
        	  company.name as companyName,
        	  company.address,
            company.logo,
        	  company.cover,
        	  company.lat,
        	  company.lng,
            c.coupons,
            k.checkinAt,
            k.checkoutAt,
            k.id
          FROM company
          LEFT JOIN (SELECT id, checkinAt, checkoutAt, companyId FROM checkins WHERE userId = :userId AND checkoutAt IS NULL GROUP BY companyId ORDER BY id ASC LIMIT 1) as k ON (company.companyId = k.companyId)
          LEFT JOIN (SELECT count(*) as coupons, companyId FROM coupon WHERE validity >= NOW() AND status = 'ACTIVATED' GROUP BY companyId) as c ON (company.companyId = c.companyId)
          WHERE company.companyId = :companyId`;
            let [rows, metadata] = await database.query(sql, {
              replacements: {
                userId,
                companyId
              }
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Empresa não localizada.',
                    data: [],
                });

            let company = rows
            console.log(rows.length)
            return resolve({
                status: 'OK',
                message: 'Empresa localizada.',
                data: company,
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

module.exports.doCheckin = (userId, companyId) => {
  let checkinAt = moment().format('YYYY-MM-DD HH:mm:ss');

    return new Promise(async (resolve, reject) => {
        try {
          //ADICIONA UM USUÁRIO AO CHECKIN
          let sql = `INSERT INTO checkins (userId, companyId, checkinAt) VALUES (:userId, :companyId, :checkinAt)`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                userId,
                companyId,
                checkinAt
            }
          });
          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Fala ao tentar fazer checkin'
              });

          return resolve({
              status: 'OK',
              message: 'Checkin realizado com sucesso',
              action: 'checkin',
              checkinAt: checkinAt,
              checkinId: rows
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

module.exports.doCheckout = (userId, companyId, checkinId) => {
  let checkoutAt = moment().format('YYYY-MM-DD HH:mm:ss');

    return new Promise(async (resolve, reject) => {
        try {
          //ADICIONA UM USUÁRIO AO CHECKIN
          let sql = `UPDATE checkins SET checkoutAt = :checkoutAt WHERE userId = :userId AND companyId = :companyId AND id = :checkinId`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                checkoutAt,
                userId,
                companyId,
                checkinId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Fala ao tentar fazer checkout'
              });

          return resolve({
              status: 'OK',
              message: 'Checkout realizado com sucesso',
              action: 'checkout',
              checkoutAt: checkoutAt,
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

module.exports.verifyCheckin = (userId, companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
          //ADICIONA UM USUÁRIO AO CHECKIN
          let sql = `SELECT id, companyId FROM checkins WHERE companyId != :companyId AND userId = :userId AND checkoutAt IS NULL`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                userId,
                companyId
              }
          });
          if (!rows || rows.length <= 0)
              return resolve({
                  status: 'FAIL',
                  autoCheckout: false
              });
              console.log("rows.id: " + JSON.stringify(rows))

          return resolve({
              status: 'OK',
              autoCheckout: true,
              id: rows[0].id,
              company: rows[0].companyId,
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
