const service = require("./chat-service")

// /** GET CATEGORY */
// module.exports.get = async (params, res) => {
//     try {
//         let chat = 'On socket conect to a chat, make logic to return all messages and get to the chat messages. THIS IS A MESSAGE FROM BACKEND';

//         return chat
//     } catch (e) {
//         return e
//     }

// };

// /**
//  * CREATE NEW HOBBIE
//  */
// module.exports.getChatHistory = async (req, res) => {
//     console.log(req.body.userId)
//     if (!req.body.userId) return res.status(400).json({
//         status: 'FAIL',
//         message: 'Id do usuário não foi informado'
//     });

//     if (!req.body.room) return res.status(400).json({
//         status: 'FAIL',
//         message: 'Chat não foi informado'
//     });

//     try {
//         let result = await server.client.get(req.body.room, async (err, history) => history);
//         let resultJson = JSON.parse(result)
//         console.log(JSON.stringify(result[req.body.userId]))
//         return res.json(resultJson[req.body.userId]);
//     } catch (err) {
//         return res.status(500).json(err);
//     }

// }

// /**
// * CREATE NEW HOBBIE
// */
// module.exports.saveUserChats = async (params) => {

//     try {
//         if (!req.body.userId) return res.status(400).json({
//             status: 'FAIL',
//             message: 'Id do usuário não foi informado'
//         });

//         if (!req.body.room) return res.status(400).json({
//             status: 'FAIL',
//             message: 'Chat não foi informado'
//         });
//         let result = await server.client.get(room, async (err, history) => JSON.parse(history))
//         return res.json(result);
//     } catch (err) {
//         return res.status(500).json(err);
//     }
// }

// module.exports.userChats = async (params) => {
//     console.log("###### userChats %%%%%%")
//     return await server.client.get(params.room, async (err, user) => {

//         if (!user) return

//         let redisData = JSON.parse(user)
//         /**
//          * Chat message
//          */
//         console.log("###### userChats -> redisData (2) %%%%%%")
//         console.log(params)

//         // await server.client.set(params.room, JSON.stringify(redisData))
//     })

//     console.log("###### PARAMS %%%%%%")
//     let chats =  await server.client.get(params.room, async (err, room) => {
//         console.log(chats)
//     })
//     console.log(params)
//     try {
//         let result = await server.client.get(room, async (err, history) => JSON.parse(history))
//         return res.json(result);
//     } catch (err) {
//         return res.status(500).json(err);
//     }
// }




// /** SAVE CATEGORY */
// module.exports.clear = async (params) => {
//     try {
//         const { user, room } = params
//         // Try fetching the result from Redis first in case we have it cached
//         return await server.client.get(room, async (err, history) => {

//             if (!history) return

//             let redisData = JSON.parse(history)
//             /**
//              * Chat message
//              */
//             console.log(redisData)
//             redisData[user].unreadMessages = []

//             await server.client.set(params.room, JSON.stringify(redisData))
//         })
//     } catch (e) {
//         console.log(e)
//         // return res.status(500).json(err);
//     }

// };



// /** SAVE CATEGORY */
// module.exports.save = async (params) => {

//     console.log('==> Chat save <==')
//     console.log(params)
//     try {
//         const { message, user } = params
//         // Try fetching the result from Redis first in case we have it cached
//         console.log(params.room)
//         return await server.client.get(params.room, async (err, room) => {
//             console.log(err)
//             /**
//              * Se não tive chat criado... então ele vai criar o redis do chat
//              */
//             console.log('chat ctrl')

//             let redisData = JSON.parse(room)
//             /**
//              * If redis chat not exists, then create
//              */
//             if (!redisData || !redisData.room) {
//                 await server.client.set(params.room, JSON.stringify(params))
//                 redisData = await server.client.get(params.room, async (err, history) => JSON.parse(history))
//             }

//             if (!redisData[user]) return
//             /**
//              * If user not seeing, then update redis with new unread message
//              */
//             if (!params[user].reading) {
//                 redisData[user].unreadMessages.push({
//                     message: message.message,
//                     id: message.id, // vai ser retirado ,
//                     sender: message.sender,
//                     datetime: message.datetime,
//                     time: message.time,
//                     total: message.total, // vai ser retirado ,
//                     username: message.username, // vai ser retirado 
//                     viewed: message.viewed, // vai ser retirado 
//                     room: message.room,
//                 })
//             }
//             console.log("==> REDIS DATA <==")
//             console.log(redisData)
//             await server.client.set(params.room, JSON.stringify(redisData))
//         })
//     } catch (e) {
//         console.log(e)
//         // return res.status(500).json(err);
//     }

// };

/****
 * 
 * 
 * 
 * NEW CHAT
 * 
 * 
 * 
 */

// const getChatHistory = async (req, res) => {
//     console.log(req.body.userId)
//     if (!req.body.userId) return res.status(400).json({
//         status: 'FAIL',
//         message: 'Id do usuário não foi informado'
//     });

//     if (!req.body.room) return res.status(400).json({
//         status: 'FAIL',
//         message: 'Chat não foi informado'
//     });

//     try {
//         // let result = await server.client.get(req.body.room, async (err, history) => history);
//         let result = await server.client.get('req.body.room, async (err, history) => history');
//         let resultJson = JSON.parse(result)
//         console.log(JSON.stringify(result[req.body.userId]))
//         return res.json(resultJson[req.body.userId]);
//     } catch (err) {
//         return res.status(500).json(err);
//     }

// }

/**
 * SAVE UNREAD USER MEESSAGE
 * @param {*} param0 
 */
const unreadMessagesSave = async ({ room, another, message }) => {
    /**
     * Get unread messages
     */
    console.log(`########## SAVE UNREAD MESSAGES ##########`)
    console.log(`room: ${room}`)
    console.log(`another: ${another}`)
    console.log(message)
    try {
        message.total = message.total +1
        console.log("### TOTAL ###")
        console.log(message.total)
        
        let total = await service.unreadMessagesSave(another, room,  JSON.stringify(message))
        return total.total
    } catch (error) {
        console.log(error)
    }


    return true
}

/**
 * GET USER UNREAD MESSAGE
 * @param {*} param0 
 */
const unreadMessagesGet = async ({ room, userId }) => {
    /**
    * Get unread messages
    */
    console.log(`########## GET UNREAD MESSAGES ##########`)
    console.log(`room: ${room}`)
    console.log(`userId: ${userId}`)

    try {
        let data = await service.unreadMessagesGet(userId, room)
        return data

    } catch (error) {

    }

}


const userLastMessageSave = async ({ room, userId, message, total = 0 }) => {
    try {
        let data = {}

        /**
         * If redis chat not exists, then create
         */
        if (!data) {
            data[room] = {}
        }
        message.total = total
        data[room] = message;


        console.log(message)
        let salve = await service.saveLastMessage(room, message.another, message.userId,  JSON.stringify(message))
        return true
    } catch (error) {
        console.log(error)
    }

}

/**
 * GET USER UNREAD MESSAGE
 * @param {*} param0 
 */
const getLastUserMessages = async ({ userId }) => {
    console.log(`########## getLastUserMessages UNREAD MESSAGES ##########`)
    try {
        let data = await service.getLastMessages(userId) 
        const hash = Object.assign({}, ...data.map(s => ({[s.room]: s})));
      /**
       * Convert array to hash data
       */
        return hash

    } catch (error) {
        return error
    }

}

const removeUnreadMessages = async ({ room, userId }) => {
    try {  
        console.log("########## REMOVING UNREAD MESSAGE TO")
        console.log(`########## ROOM ${room}`)
        console.log(`########## USER ${userId}`)

        let result = await service.removeUnreadMessage(userId, room)
        console.log(result)
        return result
     
    } catch (error) {
        console.log(error)
    }

}




module.exports = { unreadMessagesSave, unreadMessagesGet, userLastMessageSave, getLastUserMessages, removeUnreadMessages }