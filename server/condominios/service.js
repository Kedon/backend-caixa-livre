'use strict'

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const LOGS = require('../shared').LOGS;
const database = require('../database/database')

module.exports.inserir = (nome, descricao, id_administradora ) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO condominios (nome, descricao, data_cadastro, id_administradora) 
          VALUES (:nome, :descricao, :data_cadastro, :id_administradora)`, {
        replacements: {
          nome,
          descricao: descricao ? descricao : '',
          id_administradora: id_administradora ? id_administradora : null,
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

module.exports.atualizar = (id, nome, descricao, id_administradora) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('UPDATE condominios SET nome = :nome, descricao = :descricao, id_administradora = :id_administradora WHERE id = :id', {
        replacements: {
          id,
          nome,
          id_administradora,
          descricao: descricao ? descricao : null
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao atualizar condomínio.'
        });

      return resolve({
        status: 'OK',
        message: 'Condimínio atualizado com sucesso.',
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

module.exports.listar = (id_administradora) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'select condominios.id, condominios.nome, condominios.descricao, administradoras.nome AS administradora , administradoras.descricao AS adm_desc from condominios inner join administradoras ON condominios.id_administradora = administradoras.id;';
      let replacements = {};

      if (id_administradora) {
        sql += ' WHERE id_administradora = :id_administradora';
        replacements.id_administradora = id_administradora;
      }

      let [rows, metadata] = await database.query(sql, {
        replacements
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Condomínios não encontrados.',
          data: {
            condominios: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Condomínios encontrados.',
        data: {
          condominios: rows
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
          let [rows, metadata] = await database.query('SELECT * FROM condominios WHERE id= :id LIMIT 1', {
              replacements: {
                  id
              }
          });

          if (!rows || rows.length <= 0)
              return resolve({
                  status: 'FAIL',
                  message: 'Condomínio não encontrado.',
                  data: {
                      condominio: []
                  }
              });
          return resolve({
              status: 'OK',
              message: 'Condomínio encontrado.',
              data: {
                  condominio: rows
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


module.exports.listarCondominio = (id) => {
  return new Promise(async (resolve, reject) => {
      try {
          let [rows, metadata] = await database.query('SELECT * FROM condominios WHERE id= :id LIMIT 1', {
              replacements: {
                  id
              }
          });

          if (!rows || rows.length <= 0)
              return resolve({
                  status: 'FAIL',
                  message: 'Condomínio não encontrado.',
                  data: {
                      condominio: []
                  }
              });
          return resolve({
              status: 'OK',
              message: 'Condomínio encontrado.',
              data: {
                  condominio: rows
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