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
module.exports.likes = (user, current_page, offset) => {
  let userId = user.userId;
  let looking = user.looking;
  //pagination
  let per_page = 6

    return new Promise(async (resolve, reject) => {
        try {

            // INICIO DA LISTAGEM DE USUARIOS
            let psql = `SELECT 5 as teste, count(*) as total FROM users u WHERE u.userId != '${userId}' AND u.type = 'USER'`
            let [pagination, meta] = await database.query(psql, {});

            let sql = `SELECT
              u.userId,
              u.firstName,
              u.displayName,
              u.birthDate,
              m.createdAt,
                JSON_ARRAYAGG(JSON_OBJECT("photoId", p.photoId, "photoUrl", p.photoUrl)) as photos,
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
              FROM users as u
                LEFT JOIN matches as m ON (u.userId = m.senderUserId)
                LEFT JOIN userPhotos as p ON (u.userId = p.userId)
                LEFT JOIN userLocation as l ON (u.userId = l.userId)
                LEFT JOIN (SELECT g.latitude, g.longitude FROM userLocation AS g WHERE g.userId = '${userId}') as logged ON (1=1)
              WHERE u.userId != '${userId}'
              AND u.userId IN (SELECT senderUserId FROM matches WHERE receiverUserId = '${userId}' AND isMatche = false)
              AND
              CASE WHEN (SELECT looking from users WHERE userId = '${userId}') = 'MALE,FEMALE'
                THEN (looking = 'MALE,FEMALE' OR looking = (SELECT genre from users WHERE userId = '${userId}'))
                          ELSE (genre = (SELECT looking from users WHERE userId = '${userId}')
                  AND u.looking = (SELECT genre from users WHERE userId = '${userId}'))
                END
              AND u.type = 'USER'
              GROUP BY u.userId
              LIMIT ${((parseInt(current_page) - 1)*per_page)}, ${per_page}
              `;
            let [cards, metacards] = await database.query(sql, {});

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
                  data: { userInfo: userInfo },
                  pagination: {
                    current_page: parseInt(current_page),
                    next_page: (parseInt(current_page) * per_page < pagination[0].total) ? parseInt(current_page) + 1 : null,
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
