// const chatRepository = require("./chat-repository");
// const uuidv1 = require('uuid/v1');
const database = require('../database/database')

module.exports.saveLastMessage = (room, receiver, sender, value) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(`INSERT INTO lastChatMessages(dataKey, receiver, sender, datavValue) VALUES (:room, :receiver, :sender, :value) ON DUPLICATE KEY UPDATE datavValue = :value;`, {
                replacements: {
                    room,
                    value,
                    receiver,
                    sender
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar mensagem'
                });

            return resolve({
                status: 'OK',
                message: 'Mensagem salva com sucesso!',
                data: {
                    room: room
                }
            });

        } catch (err) {
            console.log(err)
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}


module.exports.unreadMessagesSave = (userId, room, value) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(`INSERT INTO userUnreadMessages(userId, room, datavValue) VALUES (:userId, :room, :value)`, {
                replacements: {
                    userId,
                    room,
                    value
                }
            });
            let [rowsCount, metadataCount] = await database.query(`SELECT COUNT(id) AS total from userUnreadMessages where userId = :userId AND room = :room limit 1;`, {
                replacements: {
                    userId,
                    room,
                    value
                }
            });

            console.log("rowsCount")

            console.log(rowsCount)
            const total =  rowsCount.map((r) => r.total)[0]

            console.log("metadataCount")
            console.log(total)
            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar mensagem não lida pelo outro usuário'
                });

            return resolve({total: total});

        } catch (err) {
            console.log(err)
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}



module.exports.unreadMessagesGet = (userId, room) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM userUnreadMessages WHERE userId = :userId AND room = :room', {
                replacements: {
                    userId,
                    room
                }
            });
            if (!rows || rows.length <= 0)
                return resolve([]);

            let messages = rows.map((r) => {
                return { ...r.datavValue };
            })

            return resolve(messages);
        } catch (err) {
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


module.exports.removeUnreadMessage = (userId, room) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('DELETE FROM userUnreadMessages WHERE userId = :userId AND room = :room', {
                replacements: {
                    userId,
                    room
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao excluir mensagens não lidas.'
                });

            return resolve({
                status: 'OK',
                message: 'Messagens das com sucesso.',
                data: {
                    messages: userId
                }
            });
        } catch (err) {
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.getLastMessages = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(`SELECT *,
            (
                SELECT COUNT(*)
                FROM userUnreadMessages
                WHERE userUnreadMessages.room = lastChatMessages.datakey
                AND userId = :userId
            ) AS count
        FROM lastChatMessages WHERE sender = :userId OR receiver = :userId`, {
                replacements: {
                    userId
                }
            });
            if (!rows || rows.length <= 0)
                return resolve([]);

            let messages = rows.map((r) => {
                console.log(r)
                return {
                    ...r.datavValue ,
                    total: r.count
                    
                };
            })

            return resolve(messages);
        } catch (err) {
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}



