'use strict';

const service = require('./service');

module.exports.registrar = async (req, res) => {
  if (!req.body.nome) return res.status(400).json({
    status: 'FAIL',
    message: 'O nome não foi informado.'});
  if (!req.body.id_condominio) return res.status(400).json({
    status: 'FAIL',
    message: 'Condomínio não foi informado'});

  /* try {
    let result = await service.emailEmUso(req.body.email);
    if (result.status != 'OK')
      return res.status(400).json(result);
  } catch (err) {
    return res.status(500).json(err);
  } */

  try {
    let result = await service.inserir(req.body.nome, req.body.descricao, req.body.id_condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}


module.exports.reservar = async (req, res) => {

  if (!req.body.id_condominio) return res.status(400).json('O condomínio não foi informado.');
  if (!req.body.data_inicial) return res.status(400).json('Data da reserva não informada');
  if (!req.body.hora_inicial) return res.status(400).json('Hora inicial não informada');
  if (!req.body.hora_final) return res.status(400).json('Hora final não foi informada');
  if (!req.body.id_area_comum) return res.status(400).json('Área comum não informada');
  if (!req.body.id_usuario) return res.status(400).json('Usuário da reserva não informado');

  /* try {
    let result = await service.emailEmUso(req.body.email);
    if (result.status != 'OK')
      return res.status(400).json(result);
  } catch (err) {
    return res.status(500).json(err);
  } */
  req.body.nome
  try {
    let result = await service.reservar(req.body.data_inicial, req.body.data_final, req.body.hora_inicial, req.body.hora_final, req.body.id_area_comum, req.body.id_usuario, req.body.id_condominio, req.body.status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}


module.exports.registrarUsuarioCondominio = async (req, res) => {
  if (!req.body.id_usuario) return res.status(400).json('O ID do usuário não foi informado.');
  if (!req.body.id_condominio) return res.status(400).json('O ID do condominio não foi informado.');

  /* try {
    let result = await service.emailEmUso(req.body.email);
    if (result.status != 'OK')
      return res.status(400).json(result);
  } catch (err) {
    return res.status(500).json(err);
  } */

  try {
    let result = await service.inserirUsuarioCondominio(req.body.id_usuario, req.body.id_condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}

module.exports.atualizar = async (req, res) => {
  if (!req.body.id) return res.status(400).json('O ID da área não foi informado.');
  if (!req.body.nome) return res.status(400).json('O nome da área não foi informado.');

  /* if (req.body.tokenPayload.access != 'ADMINISTRADOR' && req.body.idUsuario != req.body.tokenPayload.payload.idUsuario)
    return res.status(403).json({
      status: 'UNAUTHORIZED',
      message: 'Permissão negada. Você não pode alterar este usuário.'
    });

  try {
    let result = await service.emailEmUso(req.body.email, req.body.idUsuario);
    if (result.status != 'OK')
      return res.status(400).json(result);
  } catch (err) {
    return res.status(500).json(err);
  } */
  try {
    let result = await service.atualizar(req.body.id, req.body.nome, req.body.descricao);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}

module.exports.alterarSenha = async (req, res) => {
  if (!req.body.idUsuario) return res.status(400).json('O ID do usuário não foi informado.');
  if (!req.body.senha) return res.status(400).json('A senha não foi informada.');

  if (req.body.tokenPayload.access != 'ADMINISTRADOR' && req.body.idUsuario != req.body.tokenPayload.payload.idUsuario)
    return res.status(403).json({
      status: 'UNAUTHORIZED',
      message: 'Permissão negada. Você não pode alterar este usuário.'
    });

  try {
    let result = await service.alterarSenha(req.body.idUsuario, req.body.senha);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.emailEmUso = async (req, res) => {
  if (!req.body.email) return res.status(400).json('O e-mail não foi informado.');

  try {
    let result = await service.emailEmUso(req.body.email);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.autenticar = async (req, res) => {
  if (!req.body.email) return res.status(400).json('O e-mail não foi informado.');
  if (!req.body.senha) return res.status(400).json('A senha não foi informada.');

  try {
    let result = await service.autenticar(req.body.email, req.body.senha);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {
  if (!req.body.id_condominio) return res.status(400).json({
    status: 'FAIL',
    message: 'Condomínio não informado.',
  });
  try {
    let result = await service.listar(req.body.id_condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.listarReservas = async (req, res) => {
  if (!req.body.id_condominio) return res.status(400).json('Condominio não informado');
  try {
    let result = await service.listarReservas(req.body.id_condominio, req.body.id_area_comum, req.body.id_usuario, req.body.status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarArea = async (req, res) => {
  if (!req.body.id) return res.status(400).json({
    status: 'FAIL',
    message: 'A área não foi informada.'
  });
  try {
    let result = await service.listarArea(req.body.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.listarReserva = async (req, res) => {
  if (!req.body.id) return res.status(400).json('A reseva não foi informada.');
  try {
    let result = await service.listarReserva(req.body.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}