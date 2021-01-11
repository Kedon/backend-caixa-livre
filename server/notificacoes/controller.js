'use strict';

const service = require('./service');

module.exports.adicionar = async (req, res) => {
  if (!req.body.id_usuario_envio) return res.status(400).json('O ID do usuario de envio não foi informado.');
  if (!req.body.tipo) return res.status(400).json('O tipo [receber ou enviar] não foi informado.');
  if (!req.body.descricao) return res.status(400).json('A mensagem não foi informada.');
  if (!req.body.perfil_envio) return res.status(400).json('A mensagem não foi informada.');


  if (req.body.tipo && req.body.tipo === 'RECEIVER') {
    if(!req.body.id_mensagem_origem){
      return res.status(400).json('Nenhuma mensagem à responder');
    }
  }

  if (req.body.perfil_envio && req.body.perfil_envio !== undefined) {
    if(!req.body.id_condominio){
      return res.status(400).json('Você precisa selecionar pelo menos um condomínio para enviar a mensagem');
    }
  }

  try {
    let result = await service.inserir(req.body.id_usuario_envio, req.body.id_usuario_receber, req.body.id_condominio, req.body.id_administradora, req.body.id_mensagem_origem, req.body.perfil_envio, req.body.tipo, req.body.titulo, req.body.descricao, req.body.data_cadastro);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.atualizar = async (req, res) => {
  if (!req.body.idNotificacao) return res.status(400).json('O ID da notificação não foi informado.');
  if (!req.body.status) return res.status(400).json('O status não foi informado.');

  try {
    let result = await service.atualizar(req.body.idNotificacao, req.body.status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {
  if (!req.body.idCliente) return res.status(400).json('O ID do cliente não foi informado.');

  try {
    let result = await service.listar(req.body.idCliente);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.listarMensagemPrivada = async (req, res) => {
  if (!req.body.usuario) return res.status(400).json({
    status: 'FAIL',
    message:'O ID do usuario não foi informado.'});

  try {
    let result = await service.listarMensagemPrivada(req.body.usuario);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.listarMensagemPublica = async (req, res) => {
  if (!req.body.condominio) return res.status(400).json('Nenhum condomínio informado para o envio da mensagem.');

  try {
    let result = await service.listarMensagemPublica(req.body.condominio, req.body.perfil);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}