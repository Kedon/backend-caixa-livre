'use strict';

const service = require('./service');
const userService = require('../users/service');
const matchService = require('../matches/service');

/**
 * RATE USER
 */
module.exports.rateUser = async (req, res) => {
  const {receiverUserId, ratingValue, type } = req.body
  const { userId } = req.loggedUser

  if (!userId) return res.status(400).json({
    status: 'FAIL',
    message: 'Usuãrio logado não informado'
  });
  if (!receiverUserId) return res.status(400).json({
    status: 'FAIL',
    message: 'Você não informou um usuário para fazer uma avaliação'
  });
  if (!ratingValue) return res.status(400).json({
    status: 'FAIL',
    message: 'Valor da avaliação não foi informado!'
  });

  let user = await userService.listUser(receiverUserId)

  if (!user.data.user) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'O usuário que está tentando avaliar não existe'
    }
  );
  if (user && user.data && user.data.user && user.data.user.userId === userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Você não pode avaliar você mesmo'
    }
  );

  if (!type || (type.toUpperCase() !== 'PRE' && type.toUpperCase() !== 'POS') ) return res.status(400).json({
    status: 'FAIL',
    message: 'Tipo de avaliação não informada ou incorreta.'
  });
  try {
    let verify = await service.verifyRate(receiverUserId, userId, type.toUpperCase())
  
    if(verify) return res.status(400).json({
      status: 'FAIL',
      message: 'Você já avaliou esse usuário'
    });
    let result = await service.rateUser(userId,receiverUserId,type.toUpperCase(),ratingValue)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}


/**
 * VERIFY RATING
 */
module.exports.verifyRate = async (req, res) => {
  const { receiverUserId } = req.query
  const { userId } = req.loggedUser

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
    // let result = await service.verifyRate(receiverUserId,userId)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.ratingsReceived = async (req, res) => {
  const { userId } = req.loggedUser
  const { type } = req.params

  if (!userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário logado não informado'
    }
  );

  try {
    let result = await service.ratingsReceived(userId, type.toUpperCase());
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.ratingsSubmitted = async (req, res) => {
  const { userId } = req.loggedUser
  const { type } = req.params

  if (!userId) return res.status(400).json(
    {
      status: 'FAIL',
      message: 'Usuário logado não informado'
    }
  );

  try {
    let result = await service.ratingsSubmitted(userId, type.toUpperCase());
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}