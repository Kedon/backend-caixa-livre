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

module.exports.doLike = (senderUserId, receiverUserId, priority, chatName, isMatche, matchInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO matches (senderUserId, receiverUserId, chatName, isMatche, priority ) VALUES (:senderUserId, :receiverUserId, :chatName, :isMatche, :priority)', {
                replacements: {
                    senderUserId,
                    receiverUserId,
                    chatName: chatName? chatName : null,
                    isMatche: isMatche,
                    priority
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não foi possível curtir usuário'
                });

            return resolve({
                status: 'OK',
                message: 'Curtida efetuada com sucesso',
                data: {
                    senderUserId: senderUserId,
                    receiverUserId: receiverUserId,
                    chatName: chatName,
                    isMatche: isMatche,
                    matchInfo: matchInfo
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
 * Do unlike in a user
 */

module.exports.doUnlike = (senderUserId, receiverUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('DELETE FROM matches WHERE senderUserId = :senderUserId AND receiverUserId = :receiverUserId', {
                replacements: {
                    senderUserId,
                    receiverUserId
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não foi possível curtir usuário'
                });

            return resolve({
                status: 'OK',
                message: 'Like desfeito com sucesso',
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



module.exports.verifyLike = ( receiverUserId, loggeUserId ) => {

    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM matches WHERE receiverUserId = :receiverUserId AND senderUserId = :loggeUserId', {
                replacements: {
                    receiverUserId, loggeUserId
                }
            });

            /**
             * Se retornar resultado, quer dizer que usuário foi curtido, senão não
             */
            if (rows && rows.length > 0 ) {
                return resolve(true);
            } else {
                return resolve(false);
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

/**
 * Verify if logged user already was like by user that is liking
 */
module.exports.verifyMatch = (loggeUserId, receiverUserId) => {
    return new Promise(async (resolve, reject) => {
        try {
          let sql = `SELECT
                  m.id,
                  m.senderUserId,
                  m.receiverUserId,
                  JSON_OBJECT(
                    "firstName", s.firstName,
                    "cover", sc.photoUrl
                  ) as sender,
                  JSON_OBJECT(
                    "firstName", r.firstName,
                    "cover", rc.photoUrl
                  ) as receiver
                FROM matches m
                  LEFT JOIN users s ON (m.senderUserId = s.userId)
                  LEFT JOIN users r ON (m.receiverUserId = r.userId)
                  LEFT JOIN userPhotos sc ON (m.senderUserId = s.userId)
                  LEFT JOIN userPhotos rc ON (m.receiverUserId = r.userId)
                  WHERE
                    receiverUserId = :loggeUserId
                  AND
                    senderUserId = :receiverUserId
                  GROUP BY m.receiverUserId`;

            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    loggeUserId, receiverUserId
                }
            });

            /**
             * Se retornar resultado, quer dizer que usuário foi curtido, senão não
             */

           if (!rows || rows.length <= 0)
                return resolve({});

            let match = rows.map((r) => {
                return {
                    id: r.id,
                    senderUserId: r.senderUserId,
                    receiverUserId: r.receiverUserId,
                    matchInfo: {senderInfo: r.sender, receiverInfo: r.receiver},
                    isMatche: r.isMatche,
                    chatName: r.chatName,
                }
            })

            return resolve(match[0]);

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
 * UPDATE A HOBBIE
 */
module.exports.updateMatch = (id, isMatche, chatName ) => {

    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE matches SET isMatche = :isMatche, chatName = :chatName  WHERE id = :id', {
                replacements: {
                    id,
                    isMatche,
                    chatName
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar match.'
                });

            return resolve({
                status: 'OK',
                message: 'Match atualizado com sucesso.',
                data: {
                    chatName: chatName,
                    isMatche: isMatche
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


module.exports.listMatches = (loggedUserId, current_page, offset) => {

    //pagination
    let per_page = 1

    return new Promise(async (resolve, reject) => {
        try {
          let psql = `SELECT count(distinct(chatName)) as total FROM matches u WHERE (senderUserId = :loggedUserId OR receiverUserId = :loggedUserId ) AND isMatche = true LIMIT 1`
          let [pagination, meta] = await database.query(psql, {replacements: {loggedUserId}});

            let sql = `SELECT
                    m.chatName,
                    m.id,
                    m.senderUserId,
                    m.receiverUserId,
                    m.isMatche,
                    m.createdAt,
                    m.updateAT,
                    true as online,
                   JSON_OBJECT(
                      "firstName", r.firstName,
                      "cover", rc.photoUrl,
                      "birthDate", r.birthDate
                    ) as receiver,
                    JSON_OBJECT(
                       "date", NOW(),
                       "message", 'Olá, o que você irá fazer hoje após o horário de trabalho?',
                       "unreadMessages", 10
                     ) as lastChat,
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
                  ) as location
                  FROM matches m
                    LEFT JOIN users r ON (m.senderUserId = r.userId)
                    LEFT JOIN userPhotos rc ON (m.senderUserId = r.userId)
          					LEFT JOIN userLocation as l ON (m.senderUserId = l.userId)
          					LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = :loggedUserId) as logged ON (1=1)
                    WHERE
                      (senderUserId = :loggedUserId OR receiverUserId = :loggedUserId ) AND isMatche = true AND r.userId != :loggedUserId
					          GROUP BY chatName
                    LIMIT ${parseInt(offset)}, ${per_page}
                    `;
            console.log(sql);
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    loggedUserId
                }
            });

           if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: ' Nenhum match localizado.',
                    data: {
                        matches: []
                    },
                    pagination: {
                      current_page: parseInt(offset) / Math.ceil(parseInt(per_page)),
                      next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                      last_page: parseInt(current_page) - 1,
                      offset: offset,
                      per_page: per_page,
                      hasMore: false,
                      total: rows.length
                    }
                });
            let matches = rows.map((r) => {
                return r;
            })

            return resolve({
                status: 'OK',
                message: 'Matches localizados.',
                data: {
                    matches
                },
                pagination: {
                  current_page: parseInt(offset) / Math.ceil(parseInt(per_page)),
                  next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
                  last_page: parseInt(current_page) - 1,
                  offset: parseInt(offset) + rows.length,
                  hasMore: (pagination[0].total > offset) ? true : false,
                  per_page: per_page,
                  total: rows.length
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

module.exports.chatRoom = (loggedUserId, chatName) => {
  return new Promise(async (resolve, reject) => {
      try {
          let sql = `SELECT
                  m.chatName,
                  m.id,
                  m.senderUserId,
                  m.receiverUserId,
                  m.isMatche,
                  m.createdAt,
                  m.updateAT,
                  true as online,
                 JSON_OBJECT(
                    "firstName", r.firstName,
                    "cover", rc.photoUrl,
                    "birthDate", r.birthDate
                  ) as receiver,
                  JSON_OBJECT(
                     "date", NOW(),
                     "message", 'Olá, o que você irá fazer hoje após o horário de trabalho?',
                     "unreadMessages", 10
                   ) as lastChat,
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
                ) as location,
                JSON_OBJECT(
                  "sent", JSON_OBJECT("userId", sent.userId, "userPosMatchId", sent.posMatchUserId, "score", sent.score),
                  "received", JSON_OBJECT("userId", received.userId, "userPosMatchId", received.posMatchUserId, "score", received.score)
                ) AS posRating
                FROM matches m
                  LEFT JOIN users r ON (m.senderUserId = r.userId)
                  LEFT JOIN userPhotos rc ON (m.senderUserId = r.userId)
                  LEFT JOIN userLocation as l ON (m.senderUserId = l.userId)
                  LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = :loggedUserId) as logged ON (1=1)
                  LEFT JOIN userPosMatch as sent ON (sent.posMatchUserId = m.senderUserId)
                  LEFT JOIN (SELECT userId, posMatchUserId, score FROM userPosMatch GROUP BY userId) as received ON (received.userId = m.receiverUserId)
                  WHERE
                    (chatName = :chatName) AND isMatche = true AND r.userId != :loggedUserId
                  GROUP BY chatName
                  `;
          console.log(sql);
          let [rows, metadata] = await database.query(sql, {
              replacements: {
                  loggedUserId,
                  chatName
              }
          });

         if (!rows || rows.length <= 0)
              return resolve({
                  status: 'WARN',
                  message: ' Chat não encontrado.',
                  data: []
              });
          let matches = rows.map((r) => {
              return r;
          })

          return resolve({
              status: 'OK',
              message: 'Chat localizado.',
              data: matches
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

module.exports.posRating = async (user, rating) => {
    let userId = user.userId;
    let posMatchUserId = rating.posMatchUserId;
    let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    let score = rating.score;
    return new Promise(async (resolve, reject) => {
      try {
          let sql = `INSERT INTO userPosMatch (userId, posMatchUserId, createdAt, score) VALUES (:userId, :posMatchUserId, :createdAt, :score)`;
          let [rows, metadata] = await database.query(sql, {replacements: {userId, posMatchUserId, createdAt, score }});
          if (!metadata) return resolve({ status: 'FAIL', message: 'Falha ao salvar avaliação.' });

          return resolve({
              status: 'OK',
              message: 'Avaliação salva com sucesso.',
              data: {
                score: score,
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
