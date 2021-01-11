'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')


//COUPONS STATS FOR TIMELINE
module.exports.events = (userId, perPage, offset, orderBy, lastId) => {
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `SELECT e.eventId, e.title, e.description, e.price_male, e.price_female, e.datetime, e.cover, c.address, c.district, c.city, c.name, c.lng, c.lat, u.distance,
          (ST_Distance_Sphere(
            point(c.lat, c.lng),
            point(logged.latitude, logged.longitude)
            )/1000
          ) as distance
         FROM inovador.events e
         LEFT JOIN (SELECT g.latitude, g.longitude FROM inovador.userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
         LEFT JOIN (SELECT distance FROM inovador.users WHERE userId = '${userId}') as u ON (1=1)
         LEFT JOIN inovador.company c ON e.companyId = c.companyId
         WHERE Date(e.datetime) >= Date(Now())
         HAVING distance <= CASE WHEN u.distance IS NULL THEN 30 ELSE u.distance END
         ORDER BY e.datetime ${orderBy}
         LIMIT ${offset},${perPage}`;
         
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                userId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao carregar eventos'
              });

          return resolve({
              status: 'OK',
              message: 'Eventos carregados com sucesso!',
              data: rows,
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
module.exports.details = (userId, eventId) => {
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `SELECT e.eventId, e.title, e.price_male, e.price_female, e.datetime, e.cover, c.address, c.district, c.city, c.name, c.logo, c.lng, c.lat,
                        (ST_Distance_Sphere(
                          point(c.lat, c.lng),
                          point(logged.latitude, logged.longitude)
                          )/1000
                        ) as distance,
                        (SELECT COUNT(1) FROM eventsUsers WHERE intention = 'intend' AND eventId = '${eventId}' AND userId != '${userId}') AS totalIntend,
                        (SELECT COUNT(1) FROM eventsUsers WHERE intention = 'will' AND eventId = '${eventId}' AND userId != '${userId}') AS totalWill,
                        (SELECT COUNT(1) FROM eventsUsers WHERE invite = true AND eventId = '${eventId}' AND userId != '${userId}') AS totalInvite,
                        intention.intention,
                        intention.invite
	                     FROM inovador.events e
                       LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
                       LEFT JOIN inovador.company c ON e.companyId = c.companyId
                       LEFT JOIN (SELECT intention, invite FROM eventsUsers WHERE userId = '${userId}' AND eventId = '${eventId}') as intention ON (1=1)
                       WHERE
                       e.eventId = :eventId
                       HAVING distance <= 15
                       ORDER BY e.datetime ASC`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                eventId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao carregar eventos'
              });

          return resolve({
              status: 'OK',
              message: 'Eventos carregados com sucesso!',
              data: rows,
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


module.exports.intentionCheck = (userId, eventId) => {
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `SELECT * FROM eventsUsers WHERE userId = :userId AND eventId = :eventId`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                userId,
                eventId
            }
          });

          if (rows.length < 1)
              return resolve(false);

          return resolve(true);


      } catch (err) {
          LOGS.logError(err);
          return reject({
              status: 'ERROR',
              message: 'Falha interna.'
          });
      }
  });
}


module.exports.intentionInsert = (userId, eventId, intention, invite) => {
  let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `INSERT INTO eventsUsers (eventId, userId, intention, invite, createdAt) VALUES (:eventId, :userId, :intention, :invite, :createdAt)`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                eventId,
                userId,
                intention,
                invite,
                createdAt
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao carregar eventos'
              });

          return resolve({
              status: 'OK',
              message: 'Intenção inserida com sucesso',
              intention: intention,
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

module.exports.intentionUpdate = (userId, eventId, intention, invite) => {
  let updateAt = moment().format('YYYY-MM-DD HH:mm:ss');
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `UPDATE eventsUsers SET intention = :intention, invite = :invite, updateAt = :updateAt WHERE eventId = :eventId AND userId = :userId`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                eventId,
                userId,
                intention,
                invite,
                updateAt
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao carregar eventos'
              });

          return resolve({
              status: 'OK',
              message: 'Intenção aletada com sucesso',
              intention: intention,
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

module.exports.intentionList = (userId, eventId, intention, action, offset, lastRow) => {
  //pagination
  let per_page = 2

  return new Promise(async (resolve, reject) => {
      try {

        // INICIO DA LISTAGEM DE USUARIOS
        let psql = `SELECT
          max(i.id) as last,
          sum(1) as total,
          (ST_Distance_Sphere(
            point(l.latitude, l.longitude),
            point(logged.latitude, logged.longitude)
            )/1000
          ) as distance
          FROM users u
          LEFT JOIN userLocation as l ON (u.userId = l.userId)
          LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
          LEFT JOIN (SELECT intention, invite, userId, id FROM eventsUsers) i ON (u.userId = i.userId)
          LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (u.userId = blocked.receiverUserId)
          WHERE
        u.userId != '${userId}'
        AND u.userId IN (SELECT userId FROM eventsUsers WHERE intention = '${intention}' AND eventId = '${eventId}')
        AND
        CASE WHEN (SELECT looking from users WHERE userId = '${userId}') = 'MALE,FEMALE'
          THEN (looking = 'MALE,FEMALE' OR looking = (SELECT genre from users WHERE userId = '${userId}'))
                    ELSE (genre = (SELECT looking from users WHERE userId = '${userId}')
            AND u.looking = (SELECT genre from users WHERE userId = '${userId}'))
          END
        AND u.type = 'USER'
        AND blocked.action IS NULL

        GROUP BY u.userId
      HAVING distance <= 1000
      ORDER BY i.id Desc`
        let [pagination, meta] = await database.query(psql, {});


          let sql = `SELECT
            CASE WHEN liked.id > 0 THEN true ELSE false END AS haveLike,
            CASE WHEN liked.isMatche = 1 THEN true ELSE false END AS isMatche,
            CASE WHEN n.senderUserId = u.userId THEN true ELSE null END AS inviteReceived,
            CASE WHEN n.receiverUserId = u.userId THEN true ELSE null END AS inviteSent,
            n.status as inviteStatus,
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
            i.intention,
            i.invite,
              JSON_ARRAYAGG(JSON_OBJECT("photoId", p.photoId, "photoUrl", p.photoUrl)) as photos,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT('hobbieId', hobbieId, 'hobbieName', hobbieName)) FROM hobbies WHERE hobbieId IN (SELECT hobbieId FROM userHobbies WHERE userId = u.userId)) as hobbies,
              JSON_ARRAY(
                  JSON_OBJECT(
                    "latitude", l.latitude,
                    "longitude", l.longitude,
                    "near", l.near,
                    "district", l.district,
                    "city", l.city,
                    "state", l.state,
                    "distance", ST_Distance_Sphere(
                      point(l.latitude, l.longitude),
                      point(logged.latitude, logged.longitude)
                    )/1000
                  )
                ) as location,
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
              LEFT JOIN (SELECT id, receiverUserId, senderUserId, isMatche FROM matches WHERE senderUserId = '${userId}') as liked ON (u.userId = liked.receiverUserId)
              LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (u.userId = blocked.receiverUserId)
              LEFT JOIN (SELECT intention, invite, userId, id FROM eventsUsers) i ON (u.userId = i.userId)
              LEFT JOIN (SELECT id, createdAt, senderUserId, receiverUserId, status FROM eventsUsersInvites) n ON (u.userId = n.senderUserId OR u.userId = n.receiverUserId)
              WHERE u.userId != '${userId}'
              AND u.userId IN (SELECT userId FROM eventsUsers WHERE intention = '${intention}' AND eventId = '${eventId}')
              AND
              CASE WHEN (SELECT looking from users WHERE userId = '${userId}') = 'MALE,FEMALE'
                THEN (looking = 'MALE,FEMALE' OR looking = (SELECT genre from users WHERE userId = '${userId}'))
                          ELSE (genre = (SELECT looking from users WHERE userId = '${userId}')
                  AND u.looking = (SELECT genre from users WHERE userId = '${userId}'))
                END
              AND u.type = 'USER'
              AND blocked.action IS NULL
              ${(action == 'refresh' ? 'AND i.id > '+lastRow : '')}
              GROUP BY u.userId
            HAVING distance <= 1000
            ORDER BY i.id Desc
            LIMIT ${parseInt(action == 'refresh' ? 0 : offset)}, ${per_page}
            `;

          let [rows, metadata] = await database.query(sql, {});

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao carregar eventos'
              });

          return resolve({
              status: 'OK',
              message: 'Intenção aletada com sucesso',
              data: rows,
              pagination: {
                offset: parseInt(offset) + parseInt(rows.length),
                last: rows.length > 0 ? pagination[0].last : null
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

module.exports.invite = (senderUserId, receiverUserId, eventId) => {
  let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `INSERT INTO eventsUsersInvites (senderUserId, receiverUserId, eventId, createdAt) VALUES (:senderUserId, :receiverUserId, :eventId, :createdAt)`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                senderUserId,
                receiverUserId,
                eventId,
                createdAt
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha adicionar convite'
              });

          return resolve({
              status: 'OK',
              message: 'Usuário convidado com sucesso',
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

module.exports.uninvite = (senderUserId, receiverUserId, eventId) => {
  let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `DELETE FROM eventsUsersInvites WHERE senderUserId = :senderUserId AND receiverUserId = :receiverUserId AND eventId = :eventId`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                senderUserId,
                receiverUserId,
                eventId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao remover convite'
              });

          return resolve({
              status: 'OK',
              message: 'Convite removido com sucesso',
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

module.exports.status = (senderUserId, receiverUserId, eventId, status) => {
  let updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  let inviteStatus = (status == 'invite_acept' ? 'accepted' : 'rejected');
  console.log('inviteStatus: ' + inviteStatus)
  return new Promise(async (resolve, reject) => {
      try {
          //VERIFICA SE O CUPOM JÁ ESTÁ SENDO CONTABILIZADO
          let sql = `UPDATE eventsUsersInvites SET status = :inviteStatus, updatedAt = :updatedAt WHERE senderUserId = :senderUserId AND receiverUserId = :receiverUserId AND eventId = :eventId`;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                inviteStatus,
                updatedAt,
                senderUserId,
                receiverUserId,
                eventId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao salvar status do convite'
              });

          return resolve({
              status: 'OK',
              message: 'Status do convite salvo com sucesso',
              status: inviteStatus
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
module.exports.invites = (userId, action, offset, lastRow) => {
  let per_page = 2

  return new Promise(async (resolve, reject) => {
      try {
        // INICIO DA LISTAGEM DE USUARIOS
        let psql = `SELECT
          max(eui.id) as last
          FROM
          eventsUsersInvites AS eui
          LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (blocked.receiverUserId = CASE WHEN eui.receiverUserId = '${userId}' THEN eui.senderUserId ELSE eui.receiverUserId END)
          WHERE
          (eui.senderUserId = '${userId}' OR eui.receiverUserId = '${userId}')
           AND blocked.action IS NULL
           ORDER BY eui.createdAt Desc
          `
        let [pagination, meta] = await database.query(psql, {});

          let sql = `SELECT
            CASE WHEN liked.id > 0 THEN true ELSE false END AS haveLike,
            CASE WHEN liked.isMatche = 1 THEN true ELSE false END AS isMatche,
            CASE WHEN eui.receiverUserId = '${userId}' THEN true ELSE null END AS inviteReceived,
            CASE WHEN eui.senderUserId = '${userId}' THEN true ELSE null END AS inviteSent,
            (SELECT COUNT(1) FROM eventsUsers WHERE intention = 'intend' AND eventId = eui.eventId AND userId != '${userId}') AS totalIntend,
            (SELECT COUNT(1) FROM eventsUsers WHERE intention = 'will' AND eventId = eui.eventId AND userId != '${userId}') AS totalWill,
            eui.status as inviteStatus,
            eui.eventId,
            eui.senderUserId,
            eui.receiverUserId,
            eui.createdAt,
            e.cover,
            e.title,
            e.datetime,
            e.price_male,
            e.price_female,
            u.userId,
            u.firstName,
            u.displayName,
            u.birthDate,
            u.genre,
            u.occupation,
            u.description,
            u.looking,
            c.name,
            c.district,
            c.city,
            (ST_Distance_Sphere(
              point(l.latitude, l.longitude),
              point(logged.latitude, logged.longitude)
              )/1000
            ) as distance,
            JSON_ARRAY(
                JSON_OBJECT(
                  "latitude", l.latitude,
                  "longitude", l.longitude,
                  "near", l.near,
                  "district", l.district,
                  "city", l.city,
                  "state", l.state,
                  "distance", ST_Distance_Sphere(
                    point(l.latitude, l.longitude),
                    point(logged.latitude, logged.longitude)
                  )/1000
                )
              ) as location,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT('photoId', photoId, 'photoUrl', photoUrl)) FROM userPhotos WHERE userId = CASE WHEN eui.receiverUserId = '${userId}' THEN eui.senderUserId ELSE eui.receiverUserId END) as photo
            FROM eventsUsersInvites AS eui
            LEFT JOIN events e ON (e.eventId = eui.eventId)
            LEFT JOIN company c ON (e.companyId = c.companyId)
            LEFT JOIN users u ON (u.userId = CASE WHEN eui.receiverUserId = '${userId}' THEN eui.senderUserId ELSE eui.receiverUserId END)
            LEFT JOIN userLocation as l ON (l.userId = CASE WHEN eui.receiverUserId = '${userId}' THEN eui.senderUserId ELSE eui.receiverUserId END)
            LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
            LEFT JOIN (SELECT id, receiverUserId, senderUserId, action FROM userBlocked WHERE senderUserId = '${userId}') as blocked ON (blocked.receiverUserId = CASE WHEN eui.receiverUserId = '${userId}' THEN eui.senderUserId ELSE eui.receiverUserId END)
            LEFT JOIN (SELECT id, receiverUserId, senderUserId, isMatche FROM matches WHERE senderUserId = '${userId}') as liked ON (liked.receiverUserId = CASE WHEN eui.receiverUserId = '${userId}' THEN eui.senderUserId ELSE eui.receiverUserId END)
            WHERE (eui.senderUserId = '${userId}' OR eui.receiverUserId = '${userId}')
            AND blocked.action IS NULL
            ORDER BY eui.createdAt Desc
            LIMIT ${parseInt(action == 'refresh' ? 0 : offset)}, ${per_page}
            `;
          let [rows, metadata] = await database.query(sql, {
            replacements: {
                userId
            }
          });

          if (!metadata)
              return resolve({
                  status: 'FAIL',
                  message: 'Falha ao carregar eventos'
              });

          return resolve({
              status: 'OK',
              message: 'Eventos carregados com sucesso!',
              data: rows,
              pagination: {
                offset: parseInt(offset) + parseInt(rows.length),
                last: rows.length > 0 ? pagination[0].last : null
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
