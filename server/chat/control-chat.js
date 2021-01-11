const { unreadMessagesSave, unreadMessagesGet, userLastMessageSave, getLastUserMessages, removeUnreadMessages } = require('./chat-controller')
const users = [];
const unreadMessages = {}

const addUser = ({ socketId, userId, room }) => {

    /**
    * Salvar os dados no banco, ele vai controlar os usuários contectados no mesmo chat
    *  Get existentsUser from Redis (connectedUsers('connectedsUser', users))
    */
    const exinstingUser = users.find((user) => user.room === room && user.userId === userId);

    if (exinstingUser) {
        console.log(`User already in chat [ ${room} ]: ${userId}`)
        return { error: `User already in chat [ ${room} ]: ${userId}` }
    }
    const user = { socketId, userId, room }

    /**
     * Conected user to receive and send message
     */


    users.push(user);
    console.log("########## CONNECTED USER TO SEND AND RECEIVE MESSAGES ###########")
    console.log(user)
    console.log("########## ALL USERS ###########")
    console.log(users)

    /**
     * Salvar os dados no banco, ele vai controlar os usuários contectados no mesmo chat
     *  save (connectedUsers('connectedsUser', users))
     */

    return { user }
}

const anotherConnected = async (room, another, message) => {

    let usersInRoom = getUsersInRoom(room)
    let anotherUserInRoom = usersInRoom.filter(user => user.userId === another)


    if (!anotherUserInRoom || anotherUserInRoom.length <= 0) {
        /**
         * save To redis 
         * save (unreadMessages(room, unreadMessages[room])) and 
         * Return actual unreadMessages
         */
        message.total = message.total === 0 &&  1
        console.log("####### SAVING UNREAD MESSAGE TO ##########")
        let total = await unreadMessagesSave({ room, another, message });
        console.log("####### TOTAL UNREAD MESSAGE ##########")

        console.log(total)
        return { userId: another, reading: false, total: total }
    }
    // console.log('Chegou aqui')
    // console.log(anotherUserInRoom)
    // console.log(another)

    return { userId: another, reading: true, total: 0 }
    /**
     * Save all unread message to redis
     */
}


const getMyUnreadMessages = async ({ room, userId }) => {
    /**
     * get Data from Redis(unreadMessages(room, unreadMessages[room]))
     */
    // callback(error)
    let messages = await unreadMessagesGet({ room, userId })
    return { messages }

}


const saveLastMessageByUser = async ({ room, message, receiver }) => {
    /**
     * get Data from Redis(unreadMessages(room, unreadMessages[room]))
     */
    // callback(error)
    console.log(`SAVING LAST MESSAGE { ${message.sender} }`)
    await userLastMessageSave({ room, userId: message.sender, message, total: receiver.userId ===  message.sender && receiver.total})

    return true 

}


const removeUserUnreadMessages = async(room, userId) => {
    console.log(`REMOVE READ user messages: room: ${room} user: ${userId}`)
    await removeUnreadMessages({ room: room,  userId: userId})

    return true 
}

const removeUser = (socketId) => {
    const index = users.findIndex((user) => user.socketId === socketId);

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getLastMessages = async({userId}) => {

    let lastmessages = await getLastUserMessages({userId})

    return lastmessages
}

const getUser = (socketId) => users.find((user) => user.socketId === socketId)

const getUsersInRoom = (room) => users.filter((user) => user.room === room)

module.exports = { addUser, removeUser, getUser, getUsersInRoom, anotherConnected, getMyUnreadMessages, removeUserUnreadMessages, saveLastMessageByUser, getLastMessages }