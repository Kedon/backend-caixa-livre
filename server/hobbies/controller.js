'use strict';

const service = require('./service');

function emailIsValid (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * CREATE NEW HOBBIE
 */
module.exports.createHobbie = async (req, res) => {
  if (!req.body.hobbieName) return res.status(400).json({
    status: 'FAIL',
    message: 'Nome no hobbie não informado'});

  try {
    let result = await service.createHobbie(req.body.hobbieName, req.body.hobbieDescription );
    console.log(JSON.stringify(result));
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}
/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listHobbies = async (req, res) => {

  try {
    let result = await service.listHobbies(req.query.hobbieId, req.query.createdStart, req.query.createdEnd, req.query.isActive);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * UPDATE A HOBBIE
 */
module.exports.updateHobbie = async (req, res) => {

  if (!req.body.hobbieId) return res.status(400).json({
    status: 'FAIL',
    message: 'Hobbie não foi informado'});

  if (!req.body.hobbieName) return res.status(400).json({
    status: 'FAIL',
    message: 'O nome do hobbie não foi informado.'});


  try {
    let result = await service.updateHobbie(req.body.hobbieId, req.body.hobbieName, req.body.hobbieDescription, req.body.isActive);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * CHANGE HOBBIE STATUS
 */
module.exports.changeHobbieStatus = async (req, res) => {

  if (!req.body.hobbieId) return res.status(400).json({
    status: 'FAIL',
    message: 'O hobbie não foi informado'});

  req.body.isActive = req.body.isActive ? req.body.isActive : false

  try {
    let result = await service.changeHobbieStatus(req.body.hobbieId, req.body.isActive);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



/**
 * DELETE HOBBIE BY ID
 */
module.exports.removeHobbie = async (req, res) => {
console.log(req.params.hobbieId)
  if (!req.params.hobbieId) return res.status(400).json({
    status: 'FAIL',
    message: 'O hobbie não foi informado'});

  try {
    let result = await service.removeHobbie(req.params.hobbieId);
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

  console.log(req.body.condominio)
  try {
    console.log(req.body.name)
    if (!req.body.id_criador) return res.status(400).json({
      status: 'FAIL',
      message: 'Criador do orçamento não  foi informado'
    });
    let result = await service.listar(req.body.perfil, req.body.condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarUsuario = async (req, res) => {
  if (!req.body.id) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado.'});
  try {
    let result = await service.listarUsuario(req.body.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.profileHobbies = async (req, res) => {
  const { userId } = req.loggedUser;
  try {
    let result = await service.profileHobbies(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.profileHobbiesInsert = async (req, res) => {
  const { userId } = req.loggedUser;
  const { params } = req.body;
  try {
    if(params.length > 0) {
      //APAGA OS HOBBIES DO USUÁRIO
      let deleteHobbie = await service.profileHobbiesDelete(userId);

      //ADICIONA OS NOVOS HOBBIES DO USUÁRIO
      let result = await service.profileHobbiesInsert(userId, params);
      return res.json(result);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
}
