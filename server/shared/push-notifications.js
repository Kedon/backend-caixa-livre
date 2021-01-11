'use strict';

const moment = require('moment');
const admin = require("firebase-admin");
const serviceAccount = require("../../configs/serviceAccountKey.json");
const database = require('../database/database')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lawapp-47e19.firebaseio.com"
});

module.exports.enviarPushCliente = function(idCliente, titulo, mensagem, dados = {}) {
  return new Promise(async (resolve, reject) => {

    if (!idCliente) return reject('Token não informado.');

    let token;
    try {
      token = await _recuperarTokenCliente(idCliente);
    } catch (err) {
      return reject(err);
    }


    if (!titulo) titulo = 'LawAPP';
    if (!mensagem) mensagem = 'Temos novidades para você!';

    let message = {
      data: dados,
      notification: {
        title: titulo,
        body: mensagem
      },
      token
      // token: 'fkB_h_3gWhI:APA91bHLrEWlntVsgcmd1DKCPxA3q_jmyeA8ZRijRBxHdz5W8pdnDHepmy3tuZ7ap5NRRjmPNEovZefp75csx1Zy5I8VpZZOvNokm9PF8QAUJ8V9LlzxiCk3yrjDreV-k6SmyYEbrdDuRNPJcJEDWjq88VRwkO3RUg'
    }

    try {
      let idPush = await admin.messaging().send(message);
      _salvarPush(idPush, idCliente, titulo, mensagem, dados);
    } catch (err) {
      return reject(err);
    }

    return resolve('Push enviado.');
  });
}

function _recuperarTokenCliente(idCliente) {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('SELECT pushToken FROM clientes WHERE idCliente = :idCliente LIMIT 1', {
        replacements: {
          idCliente
        }
      });

      if (!rows || rows.length <= 0)
        return reject("Cliente não encontrado.");

      return resolve(rows[0].pushToken);

    } catch (err) {
      return reject(err);
    }
  });
}

function _salvarPush(idPush, idCliente, titulo, mensagem, dados) {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('INSERT INTO pushNotifications (idPush, idCliente, titulo, mensagem, dados, dataEnvio) VALUES (:idPush, :idCliente, :titulo, :mensagem, :dados, :dataEnvio)', {
        replacements: {
          idPush,
          idCliente,
          titulo: titulo ? titulo : null,
          mensagem: mensagem ? mensagem : null,
          dados: dados ? JSON.stringify(dados) : null,
          dataEnvio: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao registrar.'
        });

      return resolve({
        status: 'OK',
        message: 'Registrado com sucesso.',
        data: {
          idPush
        }
      });

    } catch (err) {
      return reject(err);
    }
  });
}