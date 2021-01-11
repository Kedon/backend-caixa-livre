'use strict';

const service = require('./service');

function emailIsValid (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * CREATE NEW HOBBIE
 */
/*module.exports.createHobbie = async (req, res) => {
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

}*/
/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.cards = async (req, res) => {
  const { userId } = req.loggedUser
  try {
    let result = await service.cards(req.loggedUser, req.query.page, req.query.offset, req.query.adsOffset);
    const {haveAds, couponId} = result;
    if(haveAds){
      //verifica se já foi criada uma linha para o dia atual
      let checkStats = await service.couponStats(couponId, "home", userId);
      const {update, couponStatsId} = checkStats
      if(update){
        //atualiza o dia com novas estatísticas
        let result = await service.statsUpdate(couponId, "prints", couponStatsId, "home", userId)
      } else {
        //cria uma linha de estatísticas para o dia
        let result = await service.statsInsert(couponId, "home", "prints", userId)
      }
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.setLocation = async (req, res, next) => {
  try {
    let result = await service.setLocation(req.body, req.loggedUser);

    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.rating = async (req, res, next) => {
  try {
    let result = await service.rating(req.loggedUser, req.body);

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

/**
 * Do unlike
 */
module.exports.blockUser = async (req, res) => {
  //console.warn(req.loggedUser)
  const senderUserId = req.loggedUser.userId;
  const receiverUserId = req.params.userId;
  const { action } = req.body;
  console.log(senderUserId)
  console.log(receiverUserId)
  console.log(action)

  try {
    if(action == 'blocked'){
      //post
      let result = await service.blockUser(senderUserId, receiverUserId, action);
      return res.json(result);

    } else if(action == 'unblock'){
      //delete
      let result = await service.unblockUser(senderUserId, receiverUserId, action);
      return res.json(result);

    } else {
      //put
      let result = await service.excludeUser(senderUserId, receiverUserId, action);
      return res.json(result);

    }
  } catch (err) {
    return res.status(500).json(err);
  }

}
