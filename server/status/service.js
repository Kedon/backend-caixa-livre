'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

module.exports.status = (loggeUserId) => {
    const currDate = moment().format('YYYY-MM-D')
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT
                  	status.*,
                      CASE WHEN a.userId = :loggeUserId THEN true ELSE false END as active
                      FROM inovador.status
                      LEFT JOIN (SELECT userId, statusId, createAt FROM inovador.statusUsers WHERE date(createAt) = date(:currDate) AND userId = :loggeUserId) as a ON (status.statusId = a.statusId)
                      ORDER BY active DESC, statusName ASC`
        try {
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    loggeUserId,
                    loggeUserId,
                    currDate
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao carregar status'
                });

            return resolve({
                status: 'OK',
                message: 'Lista de Status.',
                userStatus: rows
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

module.exports.deleteStatus = (userId) => {
  const currDate = moment().format('YYYY-MM-D')
    return new Promise(async (resolve, reject) => {
      try {
        let [rows, metadata] = await database.query('DELETE FROM statusUsers WHERE date(createAt) = date(:currDate) AND userId = :userId', {
            replacements: {
              userId,
              currDate
            }
        });
        if (!metadata)
        return resolve({
            status: 'FAIL',
            message: 'Falha ao excluir status.'
        });

        return resolve({
            status: 'OK',
            message: 'Status excluido(s) com sucesso.',
            userStatus: []
        });
      } catch (err) {
          LOGS.logError(err);
          return reject({
              status: 'ERROR',
              message: 'Falha interna.'
          });
      }
    })
}

module.exports.setStatus = (userId, params) => {
    const created = moment().format('YYYY-MM-DD HH:mm:ss')
    return new Promise(async (resolve, reject) => {

      try {
        const values = params.map((statusId, index) => { return [statusId.statusId, userId, created] });
        let [rows, metadata] = await database.query('INSERT INTO statusUsers (statusId, userId, createAt) VALUES ?', {
            replacements: [values]
        });
        if (!rows || rows.length <= 0)
            return resolve({
                status: 'WARN',
                message: 'Status não adicionados.',
            });

        let hobbies = rows

        return resolve({
            status: 'OK',
            message: 'Status adicionados.',
            userStatus: params
        });
      } catch (err) {
          LOGS.logError(err);
          return reject({
              status: 'ERROR',
              message: 'Falha interna.'
          });
      }
    })
}

/**
 * LIST USERS IN THE TIMELINE
 */
module.exports.statusUsers = (user, current_page, offset, adsOffset, params) => {
  const created = moment().format('YYYY-MM-DD HH:mm:ss')
  let userId = user.userId;
  let looking = user.looking;
  //pagination
  let per_page = 10
  const values = params && params.length > 0 ? params.map((statusId, index) => { return [statusId.statusId] }) : 0;
  
    return new Promise(async (resolve, reject) => {
        try {



            // INICIO DA LISTAGEM DE USUARIOS
            let psql = `SELECT 5 as teste, count(*) as total FROM users u WHERE u.userId != '${userId}' AND u.type = 'USER'`
            let [pagination, meta] = await database.query(psql, {});

                        let sql = `SELECT
                          'user' AS contentType,
                          blocked.action AS blocked,
                          CASE WHEN liked.id > 0 THEN true ELSE false END AS haveLike,
                          CASE WHEN liked.isMatche = 1 THEN true ELSE false END AS isMatche,
                          u.userId,
                          u.firstName,
                          u.displayName,
                          u.birthDate,
                          u.genre,
                          u.occupation,
                          u.description,
                          u.looking,
                          u.distance,
                          logged.latitude,
                          logged.longitude,
                            JSON_ARRAYAGG(JSON_OBJECT("photoId", p.photoId, "photoUrl", p.photoUrl)) as photos,
                            (SELECT JSON_ARRAYAGG(JSON_OBJECT('hobbieId', hobbieId, 'hobbieName', hobbieName)) FROM hobbies WHERE hobbieId IN (SELECT hobbieId FROM userHobbies WHERE userId = u.userId)) as hobbies,
                            (SELECT JSON_ARRAYAGG(JSON_OBJECT('statusId', statusId, 'statusName', statusName)) FROM status WHERE statusId IN (SELECT statusId FROM statusUsers WHERE userId = u.userId)) as userStatus,
                            JSON_ARRAY(
                                JSON_OBJECT(
                                  "latitude", l.latitude,
                                  "longitude", l.longitude,
                                  "near", l.near,
                                  "district", l.district,
                                  "city", l.city,
                                  "near", l.near,
                                  "state", l.state,
                                  "distance", ST_Distance_Sphere(
                                    point(l.latitude, l.longitude),
                                    point(logged.latitude, logged.longitude)
                                  )/1000
                                )
                              ) as location,
                            JSON_OBJECT(
                              "company", k.companyName,
                              "cardCheckin", k.checkinAt,
                              "loggedCheckin", t.checkinAt,
                              "logo", k.logo
                            ) AS checkin,
                            liked.isMatche,
                            (ST_Distance_Sphere(
                              point(l.latitude, l.longitude),
                              point(logged.latitude, logged.longitude)
                              )/1000
                            ) as distance

                            FROM users as u
                            LEFT JOIN userPhotos as p ON (u.userId = p.userId)
                            LEFT JOIN userLocation as l ON (u.userId = l.userId)
                            LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
                            LEFT JOIN (SELECT w.checkinAt FROM checkins w WHERE w.userId = '${userId}' AND checkoutAt IS NULL) as t ON (1=1)
                            LEFT JOIN (SELECT checkins.checkinAt, checkins.userId, company.name AS companyNAme, company.logo FROM checkins LEFT JOIN company ON (checkins.companyId = company.companyId) WHERE checkoutAt IS NULL AND company.companyId IN (SELECT companyId FROM checkins WHERE userId = '${userId}' AND checkoutAt IS NULL) GROUP BY userId) as k ON (u.userId = k.userId)
                            LEFT JOIN (SELECT id, receiverUserId, senderUserId, isMatche FROM matches WHERE senderUserId = '${userId}') as liked ON (u.userId = liked.receiverUserId)
                            LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (u.userId = blocked.receiverUserId)
                            WHERE u.userId != '${userId}'
                          AND
                          CASE WHEN (SELECT looking from users WHERE userId = '${userId}') = 'MALE,FEMALE'
                            THEN (looking = 'MALE,FEMALE' OR looking = (SELECT genre from users WHERE userId = '${userId}'))
                                      ELSE (genre = (SELECT looking from users WHERE userId = '${userId}')
                              AND u.looking = (SELECT genre from users WHERE userId = '${userId}'))
                            END
                          AND u.type = 'USER'
                          AND blocked.action IS NULL
                          AND u.userId IN (SELECT userId FROM statusUsers WHERE Date(createAt) = Date(Now()) AND statusId IN (?))
                          GROUP BY u.userId
                          HAVING distance <= CASE WHEN u.distance IS NULL THEN 30 ELSE u.distance END
                          ORDER BY u.createAt Desc
                          LIMIT ${((parseInt(current_page) - 1)*per_page)}, ${per_page}
                          `;
            let [cards, metacards] = await database.query(sql, {
              replacements: [values]
            });

            //INICIO DA LISTAGEM DE ANUNCIOS
            let pasql = `SELECT COUNT(*) AS total
                        FROM coupon
                          WHERE status = 'ACTIVATED'
                          AND validity >= NOW()
                          AND companyId IN
                          (SELECT companyId FROM company WHERE planId IN
                            (SELECT planId FROM plans WHERE JSON_SEARCH(pages, 'one', 'home'))
                          )`;
            let [pAds, metaAds] = await database.query(pasql, {});
            let ads_offset = parseInt(adsOffset) >= pAds[0].total ? 0 : parseInt(adsOffset);

            let aSql = `SELECT coupon.*,
                        company.name AS companyName,
                        company.logo
                        FROM coupon
                          LEFT JOIN company USING (companyId)
                          WHERE coupon.status = 'ACTIVATED'
                          AND coupon.validity >= NOW()
                          AND coupon.companyId IN
                          (SELECT companyId FROM company WHERE planId IN
                            (SELECT planId FROM plans WHERE JSON_SEARCH(pages, 'one', 'home'))
                          ) GROUP BY coupon.couponId ORDER BY couponAiId Desc LIMIT ${parseInt(ads_offset)}, 1`;
            let [ads, metaads] = await database.query(aSql, {});




            if (!cards || cards.length <= 0) {
              console.log('Nada a exibir')
              return resolve({
                  status: 'WARN',
                  message: 'Não há usuários.',
                  data: { userInfo: [] }
              });
            } else {
              console.log('Listando cards')
              console.log(pagination[0].total)

              let userInfo = cards
              console.log(JSON.stringify(userInfo))
              return resolve({
                  status: 'OK',
                  message: 'Usuários localizados.',
                  data: { userInfo: userInfo.concat({ "contentType": "ads", ads}) },
                  haveAds: ads.length > 0 ? true : false,
                  couponId: ads.length > 0 ? ads[0].couponId : [],
                  pagination: {
                    current_page: parseInt(current_page),
                    next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                    offset: parseInt(offset) + parseInt(per_page),
                    adsOffset: parseInt(adsOffset) + 1,
                    per_page: per_page,
                    total: pagination[0].total,
                  }

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
          console.log('rows')
          if (rows && rows.length > 0 ) {
            console.log(rows[0].couponStatsId)
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
