'use strict'

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const LOGS = require('../shared').LOGS;
const database = require('../database/database')


module.exports.inserir = (id_criador, id_condominio, nome) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO orcamentos (id_criador, id_condominio, nome, uuid, data_cadastro) 
          VALUES (:id_criador, :id_condominio, :nome, :uuid, :data_cadastro)`, {
        replacements: {
          id_criador,
          id_condominio,
          nome,
          uuid,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha salvar orçamento.'
        });

      return resolve({
        status: 'OK',
        message: 'Orçamento adicionado com sucesso.',
        data: {
          id: rows
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

module.exports.inserirItens = (id_criador, id_condominio, id_orcamento, unidade_medida, nome, quantidade) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO orcamento_itens (uuid, id_criador, id_condominio, id_orcamento, unidade_medida, nome, quantidade, data_cadastro) 
          VALUES (:uuid, :id_criador, :id_condominio, :id_orcamento, :unidade_medida, :nome, :quantidade, :data_cadastro)`, {
        replacements: {
          id_criador,
          id_condominio,
          id_orcamento,
          nome,
          uuid,
          unidade_medida: unidade_medida? unidade_medida : null,
          quantidade: quantidade? quantidade : 1.0,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao adicionar item no orçamento'
        });

      return resolve({
        status: 'OK',
        message: 'Item adicionado com sucesso.',
        data: {
          id: rows
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

module.exports.listar = (id_condominio, id_criador) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'SELECT * FROM orcamentos where id_condominio = :id_condominio';
      let replacements = {
        id_condominio: id_condominio
      };

      if (id_criador) {
        sql += ' AND id_criador = :id_criador';
        replacements.id_criador = id_criador;
      }

      let [rows, metadata] = await database.query(sql, {
        replacements
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Nenhum orçamento encontrado.',
          data: {
            orcamentos: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Orçamentos encontrados.',
        data: {
          orcamentos: rows
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

module.exports.listarItens = (id_orcamento) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('SELECT * FROM orcamento_itens where id_orcamento = :id_orcamento;', {
        replacements: {
          id_orcamento
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Nenhum item encontrado.',
          data: {
            itens: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Itens encontrados.',
        data: {
          itens: rows
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


module.exports.listarOrcamento = (id_orcamento) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'SELECT * FROM orcamentos where id = :id_orcamento';
      let replacements = {
        id_orcamento: id_orcamento
      };
      let [rows, metadata] = await database.query(sql, {
        replacements
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Orçamento não encontrado.',
          data: {
            orcamento: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Orçamento encontrado.',
        data: {
          orcamento: rows
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