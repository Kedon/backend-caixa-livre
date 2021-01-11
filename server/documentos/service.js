'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const LOGS = require('../shared').LOGS;
const database = require('../database/database')

require('../database/database')

module.exports.inserir = (titulo, url, descricao, id_condominio, id_administradora, id_usuario, perfil_usuario) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO documentos (uuid, titulo, url, descricao, id_condominio, id_administradora, id_usuario, perfil_usuario, data_cadastro) 
          VALUES (:uuid, :titulo, :url, :descricao, :id_condominio, :id_administradora, :id_usuario, :perfil_usuario, :data_cadastro)`, {
        replacements: {
          uuid,
          url,
          id_condominio: id_condominio ? id_condominio : null,
          id_administradora: id_administradora ? id_administradora : null,
          id_usuario: id_usuario ? id_usuario : null,
          perfil_usuario: perfil_usuario ? perfil_usuario : null,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss'),
          titulo: titulo ? titulo : 'Documento sem título',
          descricao: descricao ? descricao : null
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao adicionar.'
        });

      return resolve('adicionado com sucesso!');

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}
/*
module.exports.inserir = (titulo, url, descricao, id_condominio, id_administradora, id_usuario, perfil_usuario) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();

    try {
      let [rows, metadata] = await database.query('INSERT INTO documentos (uuid, titulo, url, descricao, id_condominio, id_administradora, id_usuario, perfil_usuario, data_cadastro) VALUES (:uuid, :titulo, :url, :descricao, :id_condominio, :id_administradora, :id_usuario, :perfil_usuario, :data_cadastro)', {
        replacements: {
          uuid,
          url,
          id_condominio: id_condominio ? id_condominio : null,
          id_administradora: id_administradora ? id_administradora : null,
          id_usuario: id_usuario ? id_usuario : null,
          perfil_usuario: perfil_usuario ? perfil_usuario : null,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss'),
          titulo: titulo ? titulo : 'Documento sem título',
          descricao: descricao ? descricao : null
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao salvar documento.'
        });

      return resolve({
        status: 'OK',
        message: 'Documento adicionado com sucesso.',
        data: {
          url
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
*/

module.exports.atualizar = (idDocumento, data, titulo, descricao, link) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('UPDATE documentos SET data = :data, titulo = :titulo, descricao = :descricao, link = :link WHERE idDocumento = :idDocumento', {
        replacements: {
          idDocumento,
          data: data ? moment.utc(data).format('YYYY-MM-DD HH:mm:ss') : null,
          titulo: titulo ? titulo : null,
          descricao: descricao ? descricao : null,
          link: link ? link : null
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao atualizar.'
        });

      return resolve({
        status: 'OK',
        message: 'Atualizado com sucesso.',
        data: {
          idDocumento
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

module.exports.listar = (id_condominio) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'SELECT * FROM documentos';
      let replacements = {};

      if (id_condominio) {
        sql += ' WHERE id_condominio = :id_condominio';
        replacements.id_condominio = id_condominio;
      }

      let [rows, metadata] = await database.query(sql, {
        replacements
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Não encontrados.',
          data: {
            documentos: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Encontrados.',
        data: {
          documentos: rows
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

module.exports.recuperarPorId = (idDocumento) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'SELECT * FROM documentos WHERE idDocumento = :idDocumento';

      let [rows, metadata] = await database.query(sql, {
        replacements: {
          idDocumento
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Não encontrado.',
          data: {}
        });

      return resolve({
        status: 'OK',
        message: 'Encontrado.',
        data: {
          documento: rows[0]
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


module.exports.enviarArquivoS3 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var file = await upload.uploadFile();
      return resolve(file)
    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.uploadDocumento = (file, folder) => {
  return new Promise(async (resolve, reject) => {

  });
}