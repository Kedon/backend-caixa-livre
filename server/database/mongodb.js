const mongoose = require('mongoose');

let isConnected;

module.exports = connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  console.log(process.env.MONGO_URI)
  return mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }) // keep the connection string in an env var
    .then(db => { 
      isConnected = db.connections[0].readyState;
    });
};