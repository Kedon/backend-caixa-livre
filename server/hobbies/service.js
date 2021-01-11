'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

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
        console.log("CHEGA AQUI")
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
 * LIST ONE OR MORE HOBBIES BY PARAMS
 */
module.exports.listHobbies = (hobbieId, createdStart, createdEnd, isActive) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM hobbies WHERE 1 =1`;
            let order = ' ORDER BY hobbies.createAt ASC';
            let replacements = {};
            console.log(hobbieId)
            if (hobbieId && hobbieId !== null) {
                sql += ` AND hobbies.hobbieId = :hobbieId`;
                replacements.hobbieId = hobbieId;
            }
            if( createdStart && createdEnd && createdStart !== null && createdEnd !== null) {
                sql += ` AND hobbies.createAt BETWEEN :createdStart AND :createdEnd`;
                replacements.createdStart = createdStart;
                replacements.createdEnd = createdEnd;
            }
            if(isActive && isActive !== null) {
                sql += ` AND hobbies.isActive = :isActive`;
                replacements.isActive = isActive
            }


            console.log(sql)
            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Hobbies não localizados.',
                    data: {
                        hobbies: []
                    }
                });

            let hobbies = rows

            return resolve({
                status: 'OK',
                message: 'Hobbies localizados.',
                data: {
                    hobbies
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

module.exports.profileHobbies = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT
                          hobbies.hobbieId,
                          hobbies.hobbieName,
                          CASE WHEN u.id > 0 THEN TRUE ELSE FALSE END as active
                        FROM
                          hobbies
                        LEFT JOIN (SELECT userHobbies.hobbieId, userHobbies.id FROM userHobbies WHERE userId = :userId) u ON hobbies.hobbieId = u.hobbieId
                        GROUP BY hobbies.hobbieId,hobbies.hobbieName`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                  userId
                }
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Hobbies não localizados.',
                    data: {
                        hobbies: []
                    }
                });

            let hobbies = rows

            return resolve({
                status: 'OK',
                message: 'Hobbies localizados.',
                data: {
                    hobbies
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

module.exports.profileHobbiesInsert = (userId, params) => {
    return new Promise(async (resolve, reject) => {

      try {
        const values = params.map((hobbieId, index) => { return [hobbieId.hobbieId, userId] });
        let [rows, metadata] = await database.query('INSERT INTO userHobbies (hobbieId, userId) VALUES ?', {
            replacements: [values]
        });
        if (!rows || rows.length <= 0)
            return resolve({
                status: 'WARN',
                message: 'Hobbies não localizados.',
            });

        let hobbies = rows

        return resolve({
            status: 'OK',
            message: 'Hobbies adicinados.',
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

module.exports.profileHobbiesDelete = (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let [rows, metadata] = await database.query('DELETE FROM userHobbies WHERE userId = :userId', {
            replacements: {
              userId
            }
        });
        if (!metadata)
        return resolve({
            status: 'FAIL',
            message: 'Falha ao excluir hobbies.'
        });

        return resolve({
            status: 'OK',
            message: 'Hobbie(s) excluido(s) com sucesso.',
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
