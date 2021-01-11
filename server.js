'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const chatCtrl = require('./server/chat/chat-controller')

const cookieSession = require('express-session')
const passport = require('passport');
const AUTH = require('./server/shared').AUTH;
/**
 * Model to access directally the model
 */
const { addUser, removeUser, getUser, getUsersInRoom, anotherConnected, getMyUnreadMessages, removeUserUnreadMessages, saveLastMessageByUser, getLastMessages } = require('./server/chat/control-chat')


const PORT = 3002


const options = {
  swaggerDefinition: {
    // Like the one described here: https://swagger.io/specification/#infoObject
    info: {
      title: 'Shipper DOC',
      version: '1.0.0',
      description: 'Documentação da API Shipper. authorization  (Bearer eyJhbGciOiJIU...), to user authorizated user : req.loggedUser',
    },
    securityDefinitions: {
      auth: {
        type: 'apiKey',
        name: 'Authorization'
      }
    },
    security: [
      { auth: [] }
    ],
    host: 'localhost:3002/',
    //  host: 'ec2-18-234-143-228.compute-1.amazonaws.com:3002/',
    basePath: 'v1/'
  },
  // List of files to be processes. You can also set globs './routes/*.js'
  apis: ['./documentacoes/*.yaml'],
};
/**
 * DOC DEPENDENCIES
 */
const swaggerJsdoc = require('swagger-jsdoc');
const specs = swaggerJsdoc(options);
var swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false, parameterLimit: 50000
}));
// app.use(
//   cookieSession({
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//     keys: [keys.cookieKey],
//   }),
// );
app.use(passport.initialize());
app.use(passport.session());

const db = require('./server/database/database');
const connectmongo = require('./server/database/mongodb');

startServer();

async function startServer() {
  try {
    await db.authenticate();
    // await connectmongo()
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.use('/v1/users', require('./server/users/router'));
  app.use('/v1/hobbies', require('./server/hobbies/router'));
  app.use('/v1/companies', require('./server/company/router'));
  app.use('/v1/coupons', (req, res, next) => AUTH.validate(req, res, next), require('./server/coupon/router'));
  app.use('/v1/events', (req, res, next) => AUTH.validate(req, res, next), require('./server/events/router'));
  app.use('/v1/couponsCkeck', require('./server/coupon/router'));
  app.use('/v1/uploads', require('./server/uploads/router'));
  app.use('/v1/timeline', require('./server/home/router'));
  app.use('/v1/appAds', require('./server/appAds/router'));
  app.use('/v1/packages', require('./server/packages/router'));
  app.use('/v1/payments', require('./server/payments/router'));
  app.use('/v1/login',require('./server/login/router'));
  app.use('/v1/matches',(req, res, next) => AUTH.validate(req, res, next), require('./server/matches/router'));
  app.use('/v1/likes',(req, res, next) => AUTH.validate(req, res, next), require('./server/likes/router'));
  app.use('/v1/rates',(req, res, next) => AUTH.validate(req, res, next), require('./server/ratings/router'));
  app.use('/v1/pass', require('./server/pass-recover/router'));
  app.use('/v1/qrcode', require('./server/qrcode/router'));
  app.use('/v1/products', require('./server/products/router'));
  app.use('/v1/sections', require('./server/sections/router'));
  app.use('/v1/promotions', require('./server/promotions/router'));
  app.use('/v1/ads', require('./server/ads/router'));
  app.use('/v1/departments', require('./server/departments/router'));
  app.use('/v1/categories', require('./server/categories/router'));
  app.use('/v1/cart', require('./server/cart/router'));
  //app.use('/v1/stories', require('./server/stories/router'));
  let server = app.listen(3002, () => {
    console.log('Server iniciado.');

    // require('./server/shared/push-notifications');
  })


  const io = require("socket.io")(server);
  /****
   *
   *
   * save on redis
   * userChatsById
   */

  // listen on every connection
  io.on('connection', (socket) => {
    console.log('New user connected')
    console.log('socket.id', socket.id)

    /**
     * Add user to a chat room (Room ID)
     * When user enter to the chat, then conect to another user in the same chat
     */
    async function reJoinUserToChat(room, userId){
      const { error, user } = addUser({ socketId: socket.id, userId, room });

      console.log("##### RE-JOIN USER TO THE CHAT ####")
      console.log("ROOM: "+ room)
      console.log("userId: "+ userId)

      console.log(user)

      /**
       * Put user to the room
       */
      socket.join(user.room || room)
    }


    socket.on('join', async ({ room, userId }, callback) => {
      const { error, user } = addUser({ socketId: socket.id, userId, room });

      // callback(error)
      console.log(room)
      console.log(userId)
      const { empty, messages } = await getMyUnreadMessages({ room, userId })

      console.log(messages)

      /**
       * If user have any message, then send message to them
       */
      socket.emit('chat_log', { messages }, () => { 
        removeUserUnreadMessages(room, userId)
      })
      /**
       * Put user to the room
       */
      socket.join(user.room || room)
      callback()
    })


     /**
     * Add user to a chat room  by USERID Namespace NS
     * Each user have a room by ID to receive last update chat
     */
    socket.on('my-room', async function (userId) {
      socket.join(userId);

      let messages = await getLastMessages({userId})
      /**
       * Send last messages to user
       */

       console.log(`USER [${userId}] LAST CHATS MESSAGES`)
      io.sockets.in(userId).emit('my-chats', messages);
    });

    socket.on('leave', () => {
      const user = removeUser(socket.id);
      if (user) {
        console.log(`User ${user.userId} has leave the chat`)
        // socket.leave(user.room);
      }
      // socket.leave(user.room);
    })

    socket.on('sendMessage', async (message, callback) => {
      const user = getUser(socket.id)

      /**
       * USER SENDER
       */
      console.log(`  /**
      * USER SENDER
      */`)
      console.log(message)
      if (!user || !user.room) {
        console.log('User is not contected to send message')
        reJoinUserToChat(message.room, message.sender )
        return 
      }

      console.log("### SEND MY MESSAGE ### ")
      io.to(message.room).emit('message', { ...message })
      
      let receiver = await anotherConnected(user.room, message.another, message);
      console.log('receiver')
      console.log(receiver)

     

      /**
       * Save last messages on chat on userId dictionary
       */
      saveLastMessageByUser({room: message.room, message, receiver})
      callback()

      if (receiver.reading) {
        console.log('UserIdConnected')
        return false
      }
      socket.broadcast.to(receiver.userId).emit('last-message', { message, total: receiver.total });
      callback()

    })

    //listen on typing to specific chat room
    socket.on('typing', ({ state }) => {
      const user = getUser(socket.id)
      if (!user) return
      socket.broadcast.to(user.room).emit('typing', state);
    })

    
    socket.on('disconnect', function () {
      const user = removeUser(socket.id);
      console.log(socket.id)

      if (user) {
        console.log(`User ${user.userId} has leave the chat (disconnect...)`)
      }
    });
  })




  /***
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * OLD
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   */
//   const io = require("socket.io")(server);


//   //listen on every connection
//   io.on('connection', (socket) => {
//     console.log('New user connected')

//     /**
//      * Add user to a chat room (Room ID)
//      */
//     socket.on('room', function (room) {

//       console.log('######### ROOM ########', room)
//       socket.join(room);
//       chatCtrl.get({ chatId: room }).then(data => {
//         console.log(data)
//         io.sockets.in(room).emit('chat_log', data);
//         return data
//       }).catch(error => {
//         return error
//       })
//     });

//     //listen on new_message to chat romm
//     socket.on('new_message', (data) => {
//       if (!data) return
//       //broadcast the new message
//       // io.sockets.emit('new_message', {message : data.message, username : socket.username});
//       //Socket emit to chat room
//       console.log('SEND DATA (data)', data)
//       io.sockets.in(data.room).emit('new_message', data);

//       chatCtrl.save(data).then(res => {
//         console.log('SEND DATA', res)
//       }).catch(error => {
//         console.log(error)
//       })
//     })

//  /**
//      * Add user to a list chat room (Room ID)
//      */
//     socket.on('user_chats', function (room) {
//       console.log('######### ROOM CHAT ########', room)
//       socket.join(room);
//     });

//     //listen on new_message to chat romm
//     socket.on('user_chats_update', (data) => {
//       if (!data) return
//       //broadcast the new message
//       // io.sockets.emit('new_message', {message : data.message, username : socket.username});
//       //Socket emit to chat room
//       console.log('SEND DATA (data)', data)
//       io.sockets.in(data.chats).emit('user_chats_update', data);
//     })

//     //listen on typing to specific chat room
//     socket.on('typing', (data) => {
//       if (!data) return
//       socket.broadcast.to(data.room).emit('typing', { username: data.username, room: data.room });
//     })

//     //listen on typing to specific chat room
//     socket.on('update_chat_info', (data) => {
//       // console.log('update_chat_info', data)
//       if (!data) return

//       //Emit message to chat when connected
//       io.sockets.in(data.room).emit('update_chat_info', data);
//     })


//     //Get another user local storage data
//     socket.on('get_other_user_chat_data', (data) => {
//       if (!data) return
//       socket.broadcast.to(data.room).emit('get_other_user_chat_data', data);
//     })

//     //Set the user local storage (response)
//     socket.on('set_other_user_chat_data', (data) => {
//       console.log(data)
//       if (!data) return
//       socket.broadcast.to(data.room).emit('set_other_user_chat_data', data);
//     })

//     socket.on('disconnect', function () {
//       console.log('disconnect...')
//     });
//   })


}
