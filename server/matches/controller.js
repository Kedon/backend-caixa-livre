'use strict';

const service = require('./service');
const userService = require('../users/service');
const uuidv1 = require('uuid/v1');


/**
 * Do like
 */
module.exports.doLike = async (req, res) => {
  const { receiverUserId, priority } = req.body
  const senderUserId = req.loggedUser.userId
  const { email, userId, firstName, lastName, state } = req.loggedUser


  // if (!senderUserId) return res.status(400).json(
  //   {
  //     status: 'FAIL',
  //     message: 'Qual é o usuário que deseja fazer um like?'
  //   }
  // );
  /** User that will get like */
  
  let user = await userService.listUser(receiverUserId)

  if (!user.data.user) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'O usuário que está tentando curtir não existe'
    }
  );
  
  if (user && user.data && user.data.user && user.data.user.userId === userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Você não pode curtir você mesmo'
    }
  );
  
  if (!receiverUserId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Informe o usuário que vai receber o like'
    }
  );
  
  try {
    const isLiked = await service.verifyLike(receiverUserId, userId)
    console.log(isLiked)
    if (isLiked) {
      return res.status(400).json(
        {
          status: 'FAIL',
          message: 'Você já curtiu esse usuário'
        }
      );
    }

    
    const match = await service.verifyMatch(userId, receiverUserId);


    const isMatch = match && match.id ? true : false
    const chatName = match && match.id ? uuidv1() : null;
    const matchInfo = match && match.id ? match.matchInfo : null;
    /**
     * If is match create chat for first liked user
     */
    if (isMatch) {
      await service.updateMatch(match.id, isMatch, chatName);
    }

    let result = await service.doLike(userId, receiverUserId, priority, chatName, isMatch, matchInfo)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}

/**
 * Do unlike
 */
module.exports.doUnlike = async (req, res) => {
  //console.warn(req.loggedUser)
  const senderUserId = req.loggedUser.userId;
  const receiverUserId = req.params.userId;

  const match = await service.verifyMatch(senderUserId, receiverUserId);
  const isMatch = match && match.id ? true : false
  if(isMatch){
    return res.json({
      status: 'WARNING',
      message: 'Não é possível descurtir um match. Havendo necessidade, use as opções de bloquear e excluir.'
    });
  } else {
    let result = await service.doUnlike(senderUserId, receiverUserId)
    return res.json(result);
  }
}


/**
 * VERIFY LIKE
 */
module.exports.verifyLike = async (req, res) => {
  const { senderUserId, receiverUserId, loggeUserId } = req.query
  const { email, userId, firstName, lastName, state } = req.loggedUser


  // if (!senderUserId) return res.status(400).json(
  //   {
  //     status: 'FAIL',
  //     message: 'Usuário que deu o like não informado'
  //   }
  // );
  if (!receiverUserId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário que recebeu o like não informado'
    }
  );

  if (!userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário logado não informado'
    }
  );

  try {
    let result = await service.verifyLike(receiverUserId, userId)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}

/**
 * VERIFY LIKE
 * Verify if logged user already was like by user that is liking
 */
module.exports.verifyMatch = async (req, res) => {
  const { senderUserId, receiverUserId, loggeUserId } = req.query
  const { email, userId, firstName, lastName, state } = req.loggedUser

  // if (!senderUserId) return res.status(400).json(
  //   {
  //     status: 'FAIL',
  //     message: 'Usuário que deu o like não informado'
  //   }
  // );
  if (!receiverUserId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário que recebeu o like não informado'
    }
  );

  if (!userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário logado não informado'
    }
  );

  try {
    let result = await service.verifyMatch(userId, receiverUserId)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}
/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listMatches = async (req, res) => {
  const { loggeUserId } = req.params
  const { email, userId, firstName, lastName, state } = req.loggedUser

  if (!userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário logado não informado'
    }
  );

  try {
    let result = await service.listMatches(userId, Number(req.query.page), Number(req.query.offset));
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.chatRoom = async (req, res) => {
  const { chatName } = req.params;
  const { userId } = req.loggedUser

  if (!chatName) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Sala não encontrada'
    }
  );

  try {
    let result = await service.chatRoom(userId, chatName);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.posRating = async (req, res, next) => {
  try {
    let result = await service.posRating(req.loggedUser, req.body);

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
    message: 'Hobbie não foi informado'
  });

  if (!req.body.hobbieName) return res.status(400).json({
    status: 'FAIL',
    message: 'O nome do hobbie não foi informado.'
  });


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
    message: 'O hobbie não foi informado'
  });

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
  if (!req.params.hobbieId) return res.status(400).json({
    status: 'FAIL',
    message: 'O hobbie não foi informado'
  });

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
    message: 'O usuário não foi informado.'
  });
  try {
    let result = await service.listarUsuario(req.body.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
