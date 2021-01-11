'use strict'

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const LOGS = require('../shared').LOGS;
const database = require('../database/database')

module.exports.inserir = (nome, descricao) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO administradoras (nome, descricao, data_cadastro) 
          VALUES (:nome, :descricao, :data_cadastro)`, {
        replacements: {
          nome,
          descricao: descricao ? descricao : '',
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao adicionar.'
        });

      return resolve({
        status: 'OK',
        message: 'Adicionado com sucesso.',
        data: {
          nome
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

module.exports.atualizar = (id, nome, descricao) => {
  console.log(id)
  console.log(nome)
  console.log(descricao)
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('UPDATE administradoras SET nome = :nome, descricao = :descricao WHERE id = :id', {
        replacements: {
          id,
          nome,
          descricao: descricao ? descricao : null
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao atualizar Administradora.'
        });

      return resolve({
        status: 'OK',
        message: 'Administradora atualizada com sucesso.',
        data: {
          id
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

module.exports.listar = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'select * from administradoras;';
      let replacements = {};

      if (id) {
        sql += ' WHERE id = :id';
        replacements.id = id;
      }

      let [rows, metadata] = await database.query(sql, {
        replacements
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Administradoras não encontradas.',
          data: {
            administradoras: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Administradoras encontradas.',
        data: {
          administradoras: rows
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

module.exports.listarAdministradora = (id) => {
  return new Promise(async (resolve, reject) => {
      try {
          let [rows, metadata] = await database.query('SELECT * FROM administradoras WHERE id= :id LIMIT 1', {
              replacements: {
                  id
              }
          });

          if (!rows || rows.length <= 0)
              return resolve({
                  status: 'FAIL',
                  message: 'Administradora não encontrada.',
                  data: {
                      administradora: []
                  }
              });
          return resolve({
              status: 'OK',
              message: 'Administradora encontrada.',
              data: {
                  administradora: rows
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