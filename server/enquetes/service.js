'use strict'

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const LOGS = require('../shared').LOGS;
const database = require('../database/database')


module.exports.inserirEnquete = (nome, descricao, data_inicio, data_fim, id_criador, perfil_criador) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO enquetes (nome, descricao, data_inicio, data_fim, id_criador,  perfil_criador, uuid) 
          VALUES (:nome, :descricao, :data_inicio, :data_fim, :id_criador, :perfil_criador, :uuid)`, {
        replacements: {
          nome,
          id_criador,
          perfil_criador,
          uuid,
          descricao: descricao ? descricao : '',
          data_inicio: data_inicio ? data_inicio : null,
          data_fim: data_fim ? data_fim : null,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha salvar enquete.'
        });

      return resolve({
        status: 'OK',
        message: 'Enquete adicionada com sucesso.',
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


module.exports.inserirRespostas = (id_enquete, id_opcao, id_pergunta, id_criador, id_usuario, id_condominio, id_admnistradora, respostas) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO enquete_respostas (id_enquete, id_opcao, id_pergunta, id_criador, id_usuario,  id_condominio, id_admnistradora, respostas, data_cadastro, uuid) 
          VALUES (:id_enquete, :id_opcao, :id_pergunta, :id_criador, :id_usuario,  :id_condominio, :id_admnistradora, :respostas, :data_cadastro, :uuid)`, {
        replacements: {
          id_enquete,
          id_opcao,
          id_pergunta,
          id_criador,
          id_usuario,
          uuid,
          respostas,
          id_condominio: id_condominio ? id_condominio : null,
          id_admnistradora: id_admnistradora ? id_admnistradora : null,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha salvar respostas.'
        });

      return resolve({
        status: 'OK',
        message: 'Respostas adicionada com sucesso.',
        data: {
          id_enquete
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

module.exports.inserirPerguntas = (label, descricao, min, max, id_enquete, tipo, subtipo, requerido) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO perguntas (label, descricao, min, max, id_enquete, tipo, subtipo,  requerido, uuid) 
          VALUES (:label, :descricao,:min, :max, :id_enquete, :tipo, :subtipo,  :requerido, :uuid)`, {
        replacements: {
          label,
          id_enquete,
          tipo,
          uuid,
          descricao: descricao ? descricao : '',
          min: min ? min : null,
          max: max ? max : null,
          subtipo: subtipo ? subtipo : "TEXTO",
          requerido: requerido ? requerido : false,
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha salvar enquete.'
        });

      return resolve({
        status: 'OK',
        message: 'Pergunta adicionada com sucesso.',
        data: {
          label
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
module.exports.inserirOpcoes = (label, descricao, id_pergunta) => {
  return new Promise(async (resolve, reject) => {
    let uuid = uuidv1();
    try {
      let [rows, metadata] = await database.query(`
        INSERT INTO opcoes (label, descricao, id_pergunta, uuid) 
          VALUES (:label, :descricao, :id_pergunta, :uuid)`, {
        replacements: {
          label,
          id_pergunta,
          uuid,
          descricao: descricao ? descricao : '',
          data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha salvar opções.'
        });

      return resolve({
        status: 'OK',
        message: 'Opcões adicionadas com sucesso.',
        data: {
          label
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

module.exports.atualizarPergunta = (id, label, descricao, min, max, tipo, subtipo, requerido) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('UPDATE perguntas SET label = :label, descricao = :descricao,  min = :min, max = :max, tipo = :tipo, subtipo = :subtipo, requerido = :requerido WHERE id = :id', {
        replacements: {
          id,
          label,
          descricao: descricao,
          min: min,
          max: max,
          tipo: tipo,
          subtipo: subtipo,
          requerido: requerido,
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao atualizar opção.'
        });

      return resolve({
        status: 'OK',
        message: 'Opção atualizada com sucesso.',
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

module.exports.atualizarOpcao = (id, label, descricao) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('UPDATE opcoes SET label = :label, descricao = :descricao WHERE id = :id', {
        replacements: {
          id,
          label,
          descricao: descricao
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao atualizar opção.'
        });

      return resolve({
        status: 'OK',
        message: 'Opção atualizada com sucesso.',
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

module.exports.listar = (idCondominio) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = 'select enquetes.id, enquetes.nome as enquete, enquetes.descricao, enquetes.data_inicio, enquetes.data_fim, enquetes.id_criador,enquetes.data_cadastro AS criado_em, usuarios.nome As criador, usuarios.sobrenome AS criador_sobrenome from enquetes  inner join usuarios where enquetes.id_criador = usuarios.id;';
      let replacements = {};

      if (idCondominio) {
        sql += ' WHERE id_condominio = :idCliente';
        replacements.idCondominio = idCondominio;
      }

      let [rows, metadata] = await database.query(sql, {
        replacements
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Enquetes não encontradas.',
          data: {
            notificacoes: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Enquetes encontradas.',
        data: {
          pesquisas: rows
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

module.exports.listarPerguntas = (id_enquete) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('SELECT p.id, p.uuid,  p.label, p.descricao, p.min, p.max,p.id_enquete, p.tipo, p.subtipo, p.requerido, p.data_cadastro, o.id AS o_id, o.uuid as o_uuid, o.label AS o_label, o.descricao AS o_descricao FROM perguntas AS  p left join opcoes AS o ON o.id_pergunta = p.id WHERE id_enquete = :id_enquete ORDER BY p.id ASC', {
        replacements: {
          id_enquete
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'FAIL',
          message: 'Perguntas não encontradas.',
          data: {
            perguntas: []
          }
        });

      let perguntas = rows.map((r) => {
        // delete r.senha;
        return r;
      });

      return resolve({
        status: 'OK',
        message: 'Perguntas encontradas.',
        data: {
          perguntas
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


module.exports.listarEnquete = (id_enquete) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query(`Select 
      e.id AS id, e.nome, 
          e.descricao,
          e.data_inicio, 
          e.data_fim, 
          e.id_criador, 
          e.perfil_criador, 
          p.label, 
          p.id AS id_pergunta,
          p.descricao, 
          p.min, 
          p.max, 
          p.tipo, 
          p.requerido,
          p.label,
          o.label AS opcao,
          o.id AS id_opcao
          FROM enquetes AS e INNER JOIN perguntas  AS p INNER JOIN opcoes AS o ON p.id_enquete = e.id AND o.id_pergunta = p.id WHERE e.id = :id_enquete GROUP BY  o.label, p.label ORDER BY p.label, o.id`, {
        replacements: {
          id_enquete
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Enquete não encontrada.',
          data: {
            enquete: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Enquete encontrada.',
        data: {
          enquete: rows
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


module.exports.listarEnqueteContinue = (id_enquete) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query(`SELECT * FROM enquetes  WHERE id = :id_enquete`, {
        replacements: {
          id_enquete
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Enquete não encontrada.',
          data: {
            enquete: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Enquete encontrada.',
        data: {
          enquete: rows
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


module.exports.listarRespostas = (id_enquete) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query(`SELECT * FROM enquete_respostas  enquete_respostas INNER JOIN perguntas ON enquete_respostas.id_pergunta = perguntas.id WHERE enquete_respostas.id_enquete = :id_enquete`, {
        replacements: {
          id_enquete
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Respostas não encontradas.',
          data: {
            respostas: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Respostas encontradas.',
        data: {
          respostas: rows
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

module.exports.format = () => {

}