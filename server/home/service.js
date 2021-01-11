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
module.exports.cards = (user, current_page, offset, adsOffset) => {
  let userId = user.userId;
  let looking = user.looking;
  //pagination
  let per_page = 10

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
                          countLikes.total AS totalLikes,
                          u.userId,
                          u.firstName,
                          u.displayName,
                          u.birthDate,
                          u.genre,
                          u.occupation,
                          u.description,
                          u.looking,
                          u.distance,
                          u.visibility,
                          logged.latitude,
                          logged.longitude,
                            JSON_ARRAYAGG(JSON_OBJECT("photoId", p.photoId, "photoUrl", p.photoUrl)) as photos,
                            (SELECT JSON_ARRAYAGG(JSON_OBJECT('hobbieId', hobbieId, 'hobbieName', hobbieName)) FROM hobbies WHERE hobbieId IN (SELECT hobbieId FROM userHobbies WHERE userId = u.userId)) as hobbies,
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
                            LEFT JOIN (SELECT count(*) AS total, receiverUserId, senderUserId FROM matches GROUP BY receiverUserId) as countLikes ON (u.userId = countLikes.receiverUserId)
                            LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (u.userId = blocked.receiverUserId)
                            WHERE u.userId != '${userId}'
                          AND
                          CASE WHEN (SELECT looking from users WHERE userId = '${userId}') = 'MALE,FEMALE'
                            THEN (looking = 'MALE,FEMALE' OR looking = (SELECT genre from users WHERE userId = '${userId}'))
                                      ELSE (genre = (SELECT looking from users WHERE userId = '${userId}')
                              AND u.looking = (SELECT genre from users WHERE userId = '${userId}'))
                            END
                          AND u.userId NOT IN (SELECT receiverUserId FROM userContacts WHERE senderUserId = '${userId}')      
                          AND u.userId NOT IN (SELECT senderUserId FROM userContacts WHERE receiverUserId = '${userId}')      
                          AND u.type = 'USER'
                          AND (u.visibility IS NULL OR u.visibility IS TRUE)
                          AND blocked.action IS NULL
                          GROUP BY u.userId
                          HAVING distance <= CASE WHEN u.distance IS NULL THEN 30 ELSE u.distance END
                          ORDER BY u.createAt Desc
                          LIMIT ${((parseInt(current_page) - 1)*per_page)}, ${per_page}
                          `;
            let [cards, metacards] = await database.query(sql, {});

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

            offset = (Number(offset) >= Number(pagination[0].total)) ? 0 : offset

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

//COUPONS FOR TIMELINE
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

/**
 * CREATE NEW USER
 */
module.exports.setLocation = async (location, user) => {
      let userId = user.userId;
      let updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
      let latitude = location.latitude;
      let longitude = location.longitude;
      let reverse = location.reverse;
      return new Promise(async (resolve, reject) => {
          try {
              let sql = `INSERT INTO userLocation
                                (userId, updatedAt, latitude, longitude, near, district, city, state)
                         VALUES (:userId, :updatedAt, :latitude, :longitude, near, district, city, state)
                            ON  DUPLICATE KEY UPDATE
                                updatedAt = '${updatedAt}',
                                latitude = '${latitude}',
                                longitude = '${longitude}',
                                near = '${reverse[1].long_name}',
                                district = '${reverse[2].short_name}',
                                city = '${reverse[3].long_name}',
                                state = '${reverse[4].short_name}'`;
              let [rows, metadata] = await database.query(sql, {
                  replacements: {
                      userId,
                      updatedAt,
                      latitude,
                      longitude
                  }
              });

              if (!metadata)
                  return resolve({
                      status: 'FAIL',
                      message: 'Falha ao salvar localização.'
                  });

              return resolve({
                  status: 'OK',
                  message: 'Localização salva com sucesso.',
                  data: {
                      latitude: latitude,
                      longitude: longitude,
                      reverse: {city: reverse[4].long_name, state: reverse[3].long_name, near: {address: {short_name: reverse[1].short_name, long_name: reverse[1].long_name}, district: reverse[2].short_name}}
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


module.exports.rating = async (user, rating) => {
    let userId = user.userId;
    let preMatchUserId = rating.preMatchUserId;
    let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    let score = rating.score;
    let table = (rating.type == 'PRE') ? 'userPreMatch' : 'userPosMatch'
    return new Promise(async (resolve, reject) => {
      try {
          let sql = `INSERT INTO ${table} (userId, preMatchUserId, createdAt, score) VALUES (:userId, :preMatchUserId, :createdAt, :score)`;
          let [rows, metadata] = await database.query(sql, {replacements: {userId, preMatchUserId, createdAt, score }});
          if (!metadata) return resolve({ status: 'FAIL', message: 'Falha ao salvar localização.' });

          //SELECIONA DADOS NO BANCO DE DADOS PARA DAR FEEBBACK AO USUÁRIO
          let  [response, meta] = await database.query(`SELECT AVG(score) as preScore, COUNT(score) as preVotes, userId FROM userPreMatch WHERE userId = :userId AND preMatchUserId = :preMatchUserId GROUP BY userId`, {replacements: {userId, preMatchUserId}});

          return resolve({
              status: 'OK',
              message: 'Avaliação salva com sucesso.',
              data: {
                score: score,
                medRating: response[0]

              }

          });

      } catch (err) {
          LOGS.logError(err);
          return reject({
              status: 'ERROR',
              message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
          });
      }
    })
  }



/**
 * CREATE NEW HOBBIE
 */
module.exports.createHobbie = (hobbieName, hobbieDescription) => {
    let hobbieId = uuidv1();
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO hobbies (hobbieId, hobbieName, hobbieDescription) VALUES (:hobbieId, :hobbieName, :hobbieDescription)', {
                replacements: {
                    hobbieId,
                    hobbieName,
                    hobbieDescription: hobbieDescription? hobbieDescription : null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar hobbie.'
                });

            return resolve({
                status: 'OK',
                message: 'Hobbie salvo com sucesso.',
                data: {
                    hobbie: hobbieName
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
 * UPDATE A HOBBIE
 */
module.exports.updateHobbie = (hobbieId, hobbieName, hobbieDescription,isActive ) => {
    console.log(hobbieId)
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE hobbies SET hobbieName = :hobbieName, hobbieDescription = :hobbieDescription, isActive = :isActive  WHERE hobbieId = :hobbieId', {
                replacements: {
                    hobbieId,
                    hobbieName,
                    isActive,
                    hobbieDescription: hobbieDescription? hobbieDescription : null,
                }
            });
            console.log(rows)

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar usuário.'
                });

            return resolve({
                status: 'OK',
                message: 'Hobbie atualizado com sucesso.',
                data: {
                    hobbie: hobbieName
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
module.exports.changeHobbieStatus = (hobbieId, isActive) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE hobbies SET isActive =:isActive  WHERE hobbieId = :hobbieId', {
                replacements: {
                    hobbieId,
                    isActive
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar hobbie.'
                });

            return resolve({
                status: 'OK',
                message: 'Hobbie atualizado com sucesso.',
                data: {
                    isActive: isActive
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
 * REMOVE ONE HOBBIE BY UUID
 */
module.exports.removeHobbie = (hobbieId) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('DELETE FROM hobbies WHERE hobbieId =:hobbieId;', {
                replacements: {
                    hobbieId
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao excluir hobbie.'
            });

        return resolve({
            status: 'OK',
            message: 'Hobbie excluido com sucesso.',
            data: {
                hobbie: hobbieId
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

module.exports.blockUser = (senderUserId, receiverUserId, action) => {
  let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(createdAt)
  return new Promise(async (resolve, reject) => {
    try {
        let sql = `INSERT INTO userBlocked (senderUserId, receiverUserId, action, createdAt) VALUES (:senderUserId, :receiverUserId, :action, :createdAt)`;
        let [rows, metadata] = await database.query(sql, {replacements: {senderUserId, receiverUserId, action, createdAt }});
        if (!metadata) return resolve({ status: 'FAIL', message: 'Falha bloquear usuário.' });


        return resolve({
            status: 'OK',
            message: 'Usuário bloqueado com sucesso.',
        });

    } catch (err) {
        LOGS.logError(err);
        return reject({
            status: 'ERROR',
            message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
        });
    }
  })
}

module.exports.unblockUser = (senderUserId, receiverUserId, action) => {
  return new Promise(async (resolve, reject) => {
    try {
        let sql = `DELETE FROM userBlocked WHERE senderUserId = :senderUserId AND receiverUserId = :receiverUserId`;
        let [rows, metadata] = await database.query(sql, {replacements: {senderUserId, receiverUserId }});
        if (!metadata) return resolve({ status: 'FAIL', message: 'Falha desbloquear usuário.' });


        return resolve({
            status: 'OK',
            message: 'Usuário desbloqueado com sucesso.',
        });

    } catch (err) {
        LOGS.logError(err);
        return reject({
            status: 'ERROR',
            message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
        });
    }
  })
}

module.exports.excludeUser = (senderUserId, receiverUserId, action) => {
  return new Promise(async (resolve, reject) => {
    try {
        let sql = `UPDATE userBlocked SET action = :action WHERE senderUserId = :senderUserId AND receiverUserId = :receiverUserId`;
        let [rows, metadata] = await database.query(sql, {replacements: {action, senderUserId, receiverUserId }});
        if (!metadata) return resolve({ status: 'FAIL', message: 'Falha desbloquear usuário.' });


        return resolve({
            status: 'OK',
            message: 'Usuário excluído com sucesso.',
        });

    } catch (err) {
        LOGS.logError(err);
        return reject({
            status: 'ERROR',
            message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
        });
    }
  })
}
