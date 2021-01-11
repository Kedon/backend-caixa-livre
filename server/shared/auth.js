'use strict';

const ACCESS_LEVELS = require('../settings/access-levels.json');
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'JWT_SECRET_KEY'
const jwt = require('jsonwebtoken');
const cryptography = require('./cryptography');

module.exports.sign = (payload, access) => {
  // then return a token, secret key should be an env variable
  try {
    let data = cryptography.encrypt(JSON.stringify({
      payload,
      access
    }));

    let token = jwt.sign(data, SECRET_KEY);

    return token;
  } catch (err) {
    throw err;
  }
}

module.exports.decript = (token) => {
  // then return a token, secret key should be an env variable
  try {
    jwt.verify(token, SECRET_KEY, (err, data) => {
      if (err)
        return res.status(403).json({
          status: 'INVALID_TOKEN',
          message: 'Autenticação não reconhecida.'
        });


      data = JSON.parse(cryptography.decrypt(data));
      return data
    });
    return token;
  } catch (err) {
    throw err;
  }
}

module.exports.validate = (req, res, next, accessRequired = 'ABERTO') => {

  const bearerHeader = req.headers['x-api-key'];
  if (!bearerHeader)
    return res.status(403).json({
      status: 'NO_TOKEN',
      message: 'Autenticação não informada.'
    });

  /*jwt.verify(bearer[1], SECRET_KEY, (err, data) => {
    if (err)
      return res.status(403).json({
        status: 'INVALID_TOKEN',
        message: 'Autenticação não reconhecida.'
      });


    data = JSON.parse(cryptography.decrypt(data));
    req.loggedUser = data.payload;
    return next();
  });*/
  req.loggedUser = {
    message: 'Esse JSON é fixo e está sendo usando apenas para o propósito de teste.',
    razao_social: 'HM HM SUPERMERCADOS LTDA',
    nome_fantasia: 'Emporio São Paulo',
    id: 50,
    cep: '04511011',
    endereco: 'Rua Afonso Braz',
    numero: 431,
    complemento: '',
    bairro: 'Vila Nova Conceição',
    cidade: 'São Paulo',
    uf: 'SP'
  };
  return next();
}

function _checkAccessRequired(accessRequired, accessUsed) {
  let levelRequired = _getAccessLevel(accessRequired);
  let levelUsed = _getAccessLevel(accessUsed);

  return levelRequired <= levelUsed;
}

function _getAccessLevel(access) {
  if (ACCESS_LEVELS[access]) return ACCESS_LEVELS[access].level;
  return 0;
}
