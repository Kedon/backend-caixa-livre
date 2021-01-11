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
module.exports.createStorie = (userId, fileUrl, bucket, key, description) => {
    const storieId = uuidv1();
    const createAt = moment().format('YYYY-MM-DD HH:mm:ss')
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO userStories (userId, storieId, fileUrl, bucket, `key`, createAt, description) VALUES (:userId, :storieId, :fileUrl, :bucket, :key, :createAt, :description)', {
                replacements: {
                    userId, 
                    storieId, 
                    fileUrl, 
                    bucket,
                    key, 
                    createAt, 
                    description
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar imagem no banco'
                });

            return resolve({
                status: 'OK',
                message: 'Imagem salva com sucesso',
                data: {
                    storieId: storieId,
                    fileUrl: fileUrl
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

module.exports.ownStorie = (userId) => {
    const yesterday = moment.utc().local().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss');
    const now = moment.utc().local().format('YYYY-MM-DD HH:mm:ss');

    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT * FROM userStories WHERE userId = :userId AND (DATE(createAt) BETWEEN DATE(:yesterday) AND DATE(:now)) ORDER BY createAt DESC`;
            let [rows, metacards] = await database.query(sql, {
                replacements: {
                    userId,
                    now,
                    yesterday
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Não há storie',
                    data: {
                        storie: []
                    }
                });
            return resolve({
                status: 'OK',
                message: 'Storie encontrado.',
                data: {
                    storie: rows
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

module.exports.stories = (userId) => {
    const yesterday = moment.utc().local().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss');
    const now = moment.utc().local().format('YYYY-MM-DD HH:mm:ss');

    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT * FROM userStories WHERE userId = :userId AND (DATE(createAt) BETWEEN DATE(:yesterday) AND DATE(:now)) ORDER BY createAt`;
            let [rows, metacards] = await database.query(sql, {
                replacements: {
                    userId,
                    now,
                    yesterday
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Não há storie',
                    data: {
                        storie: []
                    }
                });
            return resolve({
                status: 'OK',
                message: 'Storie encontrado.',
                data: {
                    storie: rows
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

module.exports.stories = (userId, offset, perPage) => {
        const yesterday = moment.utc().local().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss');
        const now = moment.utc().local().format('YYYY-MM-DD HH:mm:ss');
      return new Promise(async (resolve, reject) => {
          try {
  
              // INICIO DA LISTAGEM DE USUARIOS
              /*let psql = `SELECT 5 as teste, count(*) as total FROM users u WHERE u.userId != '${userId}' AND u.type = 'USER'`
              let [pagination, meta] = await database.query(psql, {});*/
  
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
                            logged.latitude,
                            logged.longitude,
                                JSON_ARRAYAGG(JSON_OBJECT("photoId", p.photoId, "photoUrl", p.photoUrl)) as photos,
                              JSON_ARRAYAGG(JSON_OBJECT("storieId", s.storieId, "fileUrl", s.fileUrl, "storieDescription", s.description, "createAt", s.createAt)) as stories,
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
                              LEFT JOIN userStories as s ON (u.userId = s.userId)
                              LEFT JOIN userPhotos as p ON (u.userId = p.userId)
                              LEFT JOIN userLocation as l ON (u.userId = l.userId)
                              LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
                              LEFT JOIN (SELECT w.checkinAt FROM checkins w WHERE w.userId = '${userId}' AND checkoutAt IS NULL) as t ON (1=1)
                              LEFT JOIN (SELECT checkins.checkinAt, checkins.userId, company.name AS companyNAme, company.logo FROM checkins LEFT JOIN company ON (checkins.companyId = company.companyId) WHERE checkoutAt IS NULL AND company.companyId IN (SELECT companyId FROM checkins WHERE userId = '${userId}' AND checkoutAt IS NULL) GROUP BY userId) as k ON (u.userId = k.userId)
                              LEFT JOIN (SELECT id, receiverUserId, senderUserId, isMatche FROM matches WHERE senderUserId = '${userId}') as liked ON (u.userId = liked.receiverUserId)
                              LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (u.userId = blocked.receiverUserId)
                              WHERE u.userId != '${userId}'
                              AND (DATE(s.createAt) BETWEEN DATE('${yesterday}') AND DATE('${now}'))
                            AND
                            CASE WHEN (SELECT looking from users WHERE userId = '${userId}') = 'MALE,FEMALE'
                              THEN (looking = 'MALE,FEMALE' OR looking = (SELECT genre from users WHERE userId = '${userId}'))
                                        ELSE (genre = (SELECT looking from users WHERE userId = '${userId}')
                                AND u.looking = (SELECT genre from users WHERE userId = '${userId}'))
                              END
                            AND u.type = 'USER'
                            AND blocked.action IS NULL
                            AND s.fileUrl IS NOT NULL
                            GROUP BY u.userId
                            HAVING distance <= 15
                            ORDER BY s.createAt Desc
                            LIMIT ${offset}, ${perPage}
                            `;
              let [cards, metacards] = await database.query(sql, {});
  
              //INICIO DA LISTAGEM DE ANUNCIOS
              /*let pasql = `SELECT COUNT(*) AS total
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
              let [ads, metaads] = await database.query(aSql, {});*/
  
  
  
  
              if (!cards || cards.length <= 0) {
                console.log('Nada a exibir')
                return resolve({
                    status: 'WARN',
                    message: 'Não há stories.',
                    data: { userInfo: [] }
                });
              } else {
                console.log('Listando stories')
                //console.log(pagination[0].total)
  
                let userInfo = cards
                return resolve({
                    status: 'OK',
                    message: 'Stories localizados.',
                    data: { userInfo }
                    /*data: { userInfo: userInfo.concat({ "contentType": "ads", ads}) },
                    haveAds: ads.length > 0 ? true : false,
                    couponId: ads.length > 0 ? ads[0].couponId : [],
                    pagination: {
                      current_page: parseInt(current_page),
                      next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                      offset: parseInt(offset) + parseInt(per_page),
                      adsOffset: parseInt(adsOffset) + 1,
                      per_page: per_page,
                      total: pagination[0].total,
                    }*/
  
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
  
