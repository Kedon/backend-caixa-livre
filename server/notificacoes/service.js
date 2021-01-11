'use strict'

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const LOGS = require('../shared').LOGS;
const database = require('../database/database')

module.exports.inserir = (id_usuario_envio, id_usuario_receber, id_condominio, id_administradora, id_mensagem_origem, perfil_envio, tipo, titulo, descricao, data_cadastro) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO mensagens (id_usuario_envio, 
          id_usuario_receber, 
          id_condominio, id_administradora, 
          id_mensagem_origem,
          perfil_envio,
          tipo,
          titulo,
          descricao,
          data_cadastro) 
          VALUES (
            :id_usuario_envio,
            :id_usuario_receber, 
            :id_condominio, 
            :id_administradora, 
            :id_mensagem_origem,
            :perfil_envio,
            :tipo,
            :titulo,
            :descricao,
            :data_cadastro)`, {
        replacements: {
          id_usuario_envio,
          tipo,
          descricao,
          id_administradora,
          id_usuario_receber: id_usuario_receber ? id_usuario_receber : null,
          id_condominio: id_condominio ? id_condominio : null,
          id_administradora: id_administradora ? id_administradora : null,
          id_mensagem_origem: id_mensagem_origem ? id_mensagem_origem : null,
          perfil_envio: perfil_envio ? perfil_envio : null,
          titulo: titulo ? titulo : null,
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
          titulo
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

module.exports.atualizar = (idNotificacao, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('UPDATE notificacoes SET status = :status WHERE idNotificacao = :idNotificacao', {
        replacements: {
          idNotificacao,
          status: status
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao atualizar notificação.'
        });

      return resolve({
        status: 'OK',
        message: 'Notificação atualizada com sucesso.',
        data: {
          idNotificacao
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

module.exports.listarMensagemPrivada = (usuario) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `select m.*,
            s.nome as de,
            s.perfil as de_perfil,
            r.nome as para,
            r.perfil as para_perfil
        from condominio.mensagens m
        join condominio.usuarios s on m.id_usuario_envio = s.id
        left outer join condominio.usuarios r on m.id_usuario_receber = r.id where m.id_usuario_envio = :usuario OR m.id_mensagem_origem =:usuario;`;

      let [rows, metadata] = await database.query(sql, {
        replacements: {usuario}
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Mensagens não encontradas.',
          data: {
            mensagens: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Mensagens encontradas.',
        data: {
          mensagens: rows
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


module.exports.listarMensagemPublica = (condominio, perfil) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `select m.*,
            s.nome as de,
            s.perfil as de_perfil,
            r.nome as para,
            r.perfil as para_perfil
        from condominio.mensagens m
        join condominio.usuarios s on m.id_usuario_envio = s.id
        left outer join condominio.usuarios r on m.id_usuario_receber = r.id`;
        let replacements = {};

        if (condominio) {
            sql += ' WHERE m.id_condominio = :condominio';
            replacements.condominio = condominio;
        }
        if (perfil && perfil !== null) {
            sql +=  ' AND  m.perfil_envio = :perfil';
            replacements.perfil = perfil;
        }
        
        let [rows, metadata] = await database.query(sql, {
            replacements
        });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Mensagens não encontradas.',
          data: {
            notificacoes: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Mensagens encontradas.',
        data: {
          mensagens: rows
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