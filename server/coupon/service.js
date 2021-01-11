'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')
/**
 * CREATE NEW COUPON
 */

module.exports.createCoupon = (companyId, name, validity, description, url) => {
    let couponId = uuidv1();
    let code = Math.random().toString(36).slice(-8)
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO coupon(couponId, companyId, name, validity, code, description, url) VALUES (:couponId, :companyId, :name, :validity, :code, :description, :url)', {
                replacements: {
                    couponId,
                    companyId,
                    name,
                    validity: moment(validity).format('YYYY-MM-DD HH:mm:ss'),
                    code,
                    description: description ? description : null,
                    url: url ? url : null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao criar cupom'
                });

            return resolve({
                status: 'OK',
                message: 'Cupom criado com sucesso!',
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
 * UPDATE A USER
 */
module.exports.changeCouponValidate = (couponId, validity) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE coupon SET validity =:validity  WHERE couponId = :couponId', {
                replacements: {
                    couponId,
                    validity
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar validade do cupom'
                });

            return resolve({
                status: 'OK',
                message: 'validade atualizada com sucesso!',
                data: {
                    validity: validity,
                    couponId: couponId
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

module.exports.updateCoupon = (couponId, companyId, name, validity, description , quanity, balance, status, qrcode, qrcodeImage) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE coupon SET  name =:name, validity=:validity, description=:description , quanity=:quanity, balance=:balance, status=:status, qrcode= :qrcode, qrcodeImage= :qrcodeImage  WHERE couponId = :couponId AND companyId = :companyId', {
                replacements: {
                    couponId,
                    companyId,
                    name,
                    validity: moment(validity).format('YYYY-MM-DD HH:mm:ss'),
                    description: description ? description : null,
                    quanity: quanity ? quanity : null,
                    balance: balance ? balance : null,
                    status: status ? status : null,
                    qrcode: qrcode ? qrcode : null,
                    qrcodeImage: qrcodeImage ? qrcodeImage: null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar cupom'
                });

            return resolve({
                status: 'OK',
                message: 'Cupom atualizado com sucesso 1!',
                data: {
                    validity: validity,
                    couponId: couponId,
                    name: name,
                    description: description,
                    quanity: quanity,
                    balance: balance,
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
module.exports.listCoupons = (companyId, createdStart, createdEnd, validityStart, validityEnd, onlyQrCode, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM coupon WHERE 1 =1`;
            let order = ' ORDER BY coupon.validity ASC, coupon.createdAt ASC';
            let replacements = {};

            if (companyId && companyId !== null) {
                sql += ` AND coupon.companyId = :companyId`;
                replacements.companyId = companyId;
            }
            if (createdStart && createdEnd && createdStart !== null && createdEnd !== null) {
                sql += ` AND coupon.createdAt BETWEEN :createdStart AND :createdEnd`;
                replacements.createdStart = createdStart;
                replacements.createdEnd = createdEnd;
            }
            if (validityStart && validityEnd && validityStart !== null && validityEnd !== null) {
                sql += ` AND coupon.validity BETWEEN :validityStart AND :validityEnd`;
                replacements.validityStart = validityStart;
                replacements.validityEnd = validityEnd;
            }
            if(onlyQrCode === 'QRCODE') {
                sql += ` AND qrcodeImage IS NOT NULL`;
            }
            if(onlyQrCode === 'NOQRCODE') {
                sql += ` AND qrcodeImage IS NULL`;
            }
            if(status && (status === 'expireds' || status === 'valids')) {

                sql += ` AND ${status === 'expireds' ? 'coupon.validity <= NOW()' : 'coupon.validity >= NOW()'}`;
                replacements.status = status;
            }

            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cupons não localizados.',
                    data: {
                        companies: []
                    }
                });

            let coupons = rows

            return resolve({
                status: 'OK',
                message: 'Cupons localizados.',
                data: {
                    coupons
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

//COUPONS FOR TIMELINE
module.exports.couponsTimeline = (page, offset) => {
    return new Promise(async (resolve, reject) => {
        try {
            let psql = `SELECT COUNT(*) AS total
                      	FROM coupon
                          WHERE status = 'ACTIVATED'
                          AND validity >= NOW()
                          AND companyId IN
                      		(SELECT companyId FROM company WHERE planId IN
                      			(SELECT planId FROM plans WHERE JSON_SEARCH(pages, 'one', '${page}'))
                          )`;
            let [pagination, meta] = await database.query(psql, {replacements: {}});

            offset = parseInt(offset) >= pagination[0].total ? 0 : parseInt(offset);

            let sql = `SELECT coupon.*,
                    		company.name AS companyName,
                        company.logo
                      	FROM coupon
                          LEFT JOIN company USING (companyId)
                          WHERE coupon.status = 'ACTIVATED'
                          AND coupon.validity >= NOW()
                          AND coupon.companyId IN
                      		(SELECT companyId FROM company WHERE planId IN
                      			(SELECT planId FROM plans WHERE JSON_SEARCH(pages, 'one', '${page}'))
                          ) GROUP BY coupon.couponId LIMIT ${parseInt(offset)}, 1`;
            let replacements = {};
            let [rows, metadata] = await database.query(sql, {});

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cupons não localizados.',
                    data: {
                        companies: []
                    }
                });

            let coupons = rows

            return resolve({
                status: 'OK',
                message: 'Cupons localizados.',
                data: coupons,
                pagination: {
                  offset: offset  + 1,
                  total: Number(pagination[0].total)
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

//COUPONS STATS FOR TIMELINE
module.exports.couponStats = (couponId, page, userId) => {
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `SELECT * FROM couponStats WHERE couponId = :couponId AND userId = :userId AND DATE(createdAt) = DATE(NOW()) AND page = :page`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                couponId,
                userId,
                page
            }
          });
          if (rows && rows.length > 0 ) {
              return resolve({update: true, couponStatsId: rows[0].couponStatsId});
          } else {
              return resolve({update: false, couponStatsId: null});
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

module.exports.statsInsert = (couponId, page, metrics, userId) => {
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA ADICIONA UM CUPOM
          let sql = `INSERT INTO couponStats (couponId, userId, createdAt, page, ${metrics}) VALUES (:couponId, :userId, NOW(), :page, 1)`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                couponId,
                userId,
                page
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao criar estatística nessa data'
              });

          return resolve({
              status: 'OK',
              message: 'Estatísticas criadas com sucesso'
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

module.exports.statsUpdate = (couponId, metrics, couponStatsId, page, userId) => {
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA ATUALIZA A CONTAGEM DE UM CUPOM
          let sql = `UPDATE couponStats SET ${metrics} = (CASE WHEN ${metrics} is null THEN 1 ELSE ${metrics} + 1 END), updatedAt = NOW() WHERE couponId = :couponId AND userId = :userId AND page = :page AND couponStatsId = :couponStatsId`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                couponId,
                userId,
                page,
                couponStatsId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao criar estatística nessa data'
              });

          return resolve({
              status: 'OK',
              message: 'Estatísticas atualizadas com sucesso'
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


//COUPONS FOR MATCHES
module.exports.couponMatch = (companyId, createdStart, createdEnd, validityStart, validityEnd, onlyQrCode, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM coupon WHERE 1 =1`;
            let order = ' ORDER BY coupon.validity ASC, coupon.createdAt ASC';
            let replacements = {};

            if (companyId && companyId !== null) {
                sql += ` AND coupon.companyId = :companyId`;
                replacements.companyId = companyId;
            }
            if (createdStart && createdEnd && createdStart !== null && createdEnd !== null) {
                sql += ` AND coupon.createdAt BETWEEN :createdStart AND :createdEnd`;
                replacements.createdStart = createdStart;
                replacements.createdEnd = createdEnd;
            }
            if (validityStart && validityEnd && validityStart !== null && validityEnd !== null) {
                sql += ` AND coupon.validity BETWEEN :validityStart AND :validityEnd`;
                replacements.validityStart = validityStart;
                replacements.validityEnd = validityEnd;
            }
            if(onlyQrCode === 'QRCODE') {
                sql += ` AND qrcodeImage IS NOT NULL`;
            }
            if(onlyQrCode === 'NOQRCODE') {
                sql += ` AND qrcodeImage IS NULL`;
            }
            if(status && (status === 'expireds' || status === 'valids')) {

                sql += ` AND ${status === 'expireds' ? 'coupon.validity <= NOW()' : 'coupon.validity >= NOW()'}`;
                replacements.status = status;
            }

            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cupons não localizados.',
                    data: {
                        companies: []
                    }
                });

            let coupons = rows

            return resolve({
                status: 'OK',
                message: 'Cupons localizados.',
                data: {
                    coupons
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




module.exports.listValidsCoupons = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT * FROM coupon WHERE coupon.validity >= NOW()`;
            let order = ' ORDER BY coupon.validity ASC, coupon.createdAt ASC';
            let replacements = {};

            if (companyId && companyId !== null) {
                sql += ` AND coupon.companyId = :companyId`;
                replacements.companyId = companyId;
            }
            sql += order;

            let [rows, metadata] = await database.query(sql, {
                replacements
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cuppons não encontrados',
                    data: []
                });
                let coupons = rows
            return resolve({
                status: 'OK',
                message: 'Cuppons encontrados',
                data: {
                    coupons
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

module.exports.listExpiredCoupons = (companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT * FROM coupon WHERE coupon.validity <= NOW()`;
            let order = ' ORDER BY coupon.validity ASC, coupon.createdAt ASC';
            let replacements = {};

            if (companyId && companyId !== null) {
                sql += ` AND coupon.companyId = :companyId`;
                replacements.companyId = companyId;
            }
            sql += order;

            let [rows, metadata] = await database.query(sql, {
                replacements
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cuppons não encontrados',
                    data: []
                });
                let coupons = rows
            return resolve({
                status: 'OK',
                message: 'Cuppons não encontrados',
                data: {
                    coupons
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

module.exports.checkIsvalid = (couponId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM coupon WHERE couponId = :couponId AND coupon.validity >= NOW()', {
                replacements: {
                    couponId
                }
            });
            if (!rows || rows.length <= 0)
            return resolve({});

        let match = rows.map((r) => {
            return {
                id: r.id,
                couponId: r.couponId,
                companyId: r.companyId,
                validity: r.validity,
                code: r.code
            }
        })

        return resolve({
            status: 'OK',
            message: 'Cupom encontrado',
            data: match[0]
        }
        );

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.checkCouponUser = (code, userCode) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM coupon inner join couponUse  WHERE coupon.code = :code AND couponUse.userCode = :userCode', {
                replacements: {
                    code, userCode
                }
            });

            if (!rows || rows.length <= 0)
            return resolve({
                status: 'WARN',
                message: 'Cupom não encontrado',
                data: []
            });

            return resolve({
                status: 'OK',
                message: 'Encontrado',
                data: rows.map(r => {
                    return {
                    id: 2,
                    couponUseId: r.couponUseId,
                    couponId: r.couponId,
                    userId: r.userId,
                    status: r.status,
                    validity: r.validity,
                    code: r.code,
                    userCode: r.userCode,
                    companyId: r.companyId,
                    name: r.name,
                    description:  r.name
                }})[0]
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

module.exports.couponInUse = (couponId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM couponUse WHERE couponId = :couponId AND userId = :userId limit 1', {
                replacements: {
                    couponId, userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({});

            let match = rows.map((r) => {
                return {
                    id: r.id,
                    couponId: r.couponId,
                    status: r.status,
                    validity: r.validity,
                    code: r.code
                }
            })

            return reject({
                status: 'OK',
                message: 'Você já está usando esse cupom',
                data: match[0]
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

module.exports.userCoupons = (userId, page, offset) => {
    let per_page = 1;
    offset = parseInt(offset);
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT
              c.couponId,
              c.name,
              c.banner,
              c.validity,
              c.description,
              u.createdAt as activated,
              u.updateAT,
              u.status
              FROM coupon c
              LEFT JOIN (SELECT createdAt, status, updateAT, couponId, userId FROM couponUse) as u USING (couponId)
            	WHERE u.userId = :userId
            	AND validity >= NOW()
              LIMIT ${offset}, ${per_page}
              `;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cupons não localizados.',
                    data: {
                        coupons: []
                    },
                    pagination: {
                      page: parseInt(page),
                      //next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                      next_page: null,
                      offset: offset,
                      per_page: per_page,
                      //total: pagination[0].total,
                    }

                });

            let coupons = rows

            return resolve({
                status: 'OK',
                message: 'Cupons localizados.',
                data: {
                    coupons
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
 *
 *  USE COUPONS
 *
 */

module.exports.couponActivate = (couponId, userId, status, code) => {
    let couponUseId = uuidv1();
    let userCode = Math.floor(100000 + Math.random() * 900000);
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO couponUse(couponUseId, couponId, userId, status, validity, code, userCode) VALUES (:couponUseId, :couponId, :userId, :status, CURDATE() + 3, :code, :userCode)', {
                replacements: {
                    couponUseId,
                    couponId,
                    userId,
                    status,
                    code,
                    userCode
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao criar cupom'
                });

            return resolve({
                status: 'OK',
                message: 'Cupom criado com sucesso!',
                data: {
                    status: status,
                    activated: moment().format('YYYY-MM-DD HH:mm')
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



module.exports.couponAnalitics = (companyId, createdStart, createdEnd, status) => {
    return new Promise(async (resolve, reject) => {
        try {

            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT
            couponUse.couponUseId,
            couponUse.couponId,
            couponUse.userId,
            couponUse.validity,
            couponUse.code,
            couponUse.userCode,
            couponUse.status AS cupomStatus,
            couponUse.createdAt,
            coupon.name,
            coupon.code,
            coupon.status,
            users.firstName,
            users.lastName,
            users.genre,
            users.email
        FROM couponUse
            LEFT JOIN coupon USING (couponId)
            LEFT JOIN users USING (userId)
            LEFT JOIN company ON coupon.companyId = users.companyId WHERE 1=1 `;
            let order = ' ORDER BY coupon.createdAt ASC';
            let replacements = {};

            if (companyId && companyId !== null) {
                sql += ` AND coupon.companyId = :companyId`;
                replacements.companyId = companyId;
            }
            if( createdStart && createdEnd && createdStart !== null && createdEnd !== null) {
                sql += ` AND couponUse.createdAt BETWEEN :createdStart AND :createdEnd`;
                replacements.createdStart = createdStart;
                replacements.createdEnd = createdEnd;
            }
            if(status && status !== null) {
                sql += ` AND couponUse.status = :status`;
                replacements.status = status
            }

            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Cupons não encontrados',
                    data: {
                        coupons: []
                    }
                });

            let coupons = rows

            return resolve({
                status: 'OK',
                message: 'Cupons localizados.',
                data: {
                    coupons
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
module.exports.couponUsage = (couponUseId, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE couponUse SET status =:status  WHERE couponUseId = :couponUseId', {
                replacements: {
                    couponUseId,
                    status
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao validar cupom'
                });

            return resolve({
                status: 'OK',
                message: 'Cupom Usado com sucesso!',
                data: {
                    couponId: couponUseId,
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

/**
 * UPDATE A USER
 */

module.exports.couponDetails = (userId, couponId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT
                      	coupon.name,
                      	coupon.description,
                          coupon.code,
                          coupon.validity,
                          coupon.banner,
                          coupon.url,
                          company.name as companyName,
                          company.address,
                          company.logo,
                          company.lat,
                          company.lng,
                          CASE WHEN coupon.validity >= NOW() THEN TRUE ELSE FALSE END AS isValid,
                          (ST_Distance_Sphere(
                        		point(company.lat, company.lng),
                        		point(logged.latitude, logged.longitude)
                        	  )/1000
                        	) as distance,
                          JSON_OBJECT(
                        	  "activated", u.createdAt,
                            "status", u.status,
                            "used", u.updateAT
                        	) as coupon_state
                      	FROM coupon
                      	LEFT JOIN company USING (companyId)
                      	LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = :userId) as logged ON (1=1)
                        LEFT JOIN (SELECT createdAt, status, updateAT FROM couponUse WHERE userId = :userId AND couponId = :couponId) u on (1=1)
                        WHERE coupon.couponId = :couponId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    userId,
                    couponId,
                    userId,
                    couponId
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar cupom'
                });

            return resolve({
                status: 'OK',
                message: 'Cupom atualizado com sucesso 2!',
                data: rows
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

 module.exports.companyCoupons = (userId, companyId) => {
     return new Promise(async (resolve, reject) => {
         try {
           let sql = `SELECT
                       company.companyId,
                         company.name as companyName,
                         company.address,
                         JSON_ARRAYAGG(
                         JSON_OBJECT(
                             "couponId", c.couponId,
                             "name", c.name,
                             "banner", c.banner,
                             "expiration", c.validity,
                             "description", c.description,
                             "activated", u.createdAt,
                             "used", u.updateAT,
                             "status", u.status
                             )
                       ) as coupons
                       FROM company
                       LEFT JOIN coupon as c USING (companyId)
                       LEFT JOIN (SELECT createdAt, status, updateAT, couponId FROM couponUse WHERE userId = :userId) as u USING (couponId)
                       WHERE company.companyId = :companyId
                       AND validity >= NOW()`;

             let [rows, metadata] = await database.query(sql, {
                 replacements: {
                     companyId,
                     userId
                 }
             });

             if (!rows || rows.length <= 0)
                 return resolve({
                     status: 'WARN',
                     message: 'Cupons não localizadas.',
                     data: {
                         coupons: []
                     }
                 });

             let coupons = rows

             return resolve({
                 status: 'OK',
                 message: 'Cupons localizados.',
                 data: coupons
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
