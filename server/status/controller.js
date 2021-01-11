'use strict';

const service = require('./service');
const userService = require('../users/service');
const matchService = require('../matches/service');



/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.status = async (req, res) => {
  const { userId } = req.loggedUser
  try {
    let result = await service.status(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */

module.exports.setStatus = async (req, res) => {
  const { userId } = req.loggedUser;
  const { params } = req.body;
  console.log(params)
  try {
    if(params.length > 0) {
      let deleteStatus = await service.deleteStatus(userId);
      let result = await service.setStatus(userId, params);
      return res.json(result);
    } else {
      let result = await service.deleteStatus(userId);
      return res.json(result);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.statusUsers = async (req, res) => {
  const { userId } = req.loggedUser
  const { params } = req.body;
  const { page, offset, adsOffset } = req.query;
  try {
    let result = await service.statusUsers(req.loggedUser, page, offset, adsOffset, params);
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
