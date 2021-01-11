'use strict';

const service = require('./service');

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * CREATE NEW HOBBIE
 */
module.exports.createCompany = async (req, res) => {
  const { name, address, number, district, description, lng, lat, status } = req.body

  if (!name) return res.status(400).json({
    status: 'FAIL',
    message: 'O nme da empresa não informado'
  });

  if (!address) return res.status(400).json({
    status: 'FAIL',
    message: 'O endereço da empresa não informado'
  });

  if (!number) return res.status(400).json({
    status: 'FAIL',
    message: 'O número do endereçco da empresa não informado'
  });

  if (!district) return res.status(400).json({
    status: 'FAIL',
    message: 'O bairro da empresa não foi informado'
  });

  try {
    let result = await service.createCompany(name, address, number,district, lng, lat, description, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}
/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listCompanies = async (req, res) => {
  const { companyId, createdStart, createdEnd, status } = req.query

  try {
    let result = await service.listCompanies(companyId, createdStart, createdEnd, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * UPDATE A HOBBIE
 */
module.exports.updateCompany = async (req, res) => {

  const { companyId, name, address, number,district, lng, lat, description, status } = req.body

  if (!companyId) return res.status(400).json({
    status: 'FAIL',
    message: 'A empresa não foi informada'
  });

  if (!name) return res.status(400).json({
    status: 'FAIL',
    message: 'O nme da empresa não informado'
  });

  if (!address) return res.status(400).json({
    status: 'FAIL',
    message: 'O endereço da empresa não informado'
  });

  if (!number) return res.status(400).json({
    status: 'FAIL',
    message: 'O número do endereçco da empresa não informado'
  });

  if (!district) return res.status(400).json({
    status: 'FAIL',
    message: 'O bairro da empresa não foi informado'
  });

  try {
    let result = await service.updateCompany(companyId, name, address, number,district, lng, lat, description, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * CHANGE HOBBIE STATUS
 */
module.exports.changeCompanyStatus = async (req, res) => {
  const { companyId, status } = req.body

  if (!companyId) return res.status(400).json({
    status: 'FAIL',
    message: 'A empresa não foi informada'
  });

  let st = status ? status : false

  try {
    let result = await service.changeCompanyStatus(companyId, st);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.checkins = async (req, res) => {
  const { userId } = req.loggedUser;
  const { page, offset } = req.query;
  try {
    let result = await service.checkins(userId, page, offset);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.checkin = async (req, res) => {
  const { userId } = req.loggedUser;
  const { companyId } = req.params;
  try {
    let result = await service.checkin(userId, companyId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.doCheck = async (req, res) => {
  const { userId } = req.loggedUser;
  const { companyId, action } = req.params;
  const { checkinId } = req.body;

  try {
      let result = (action == 'in') ?
        await service.doCheckin(userId, companyId) :
        await service.doCheckout(userId, companyId, checkinId);

      let verify = await service.verifyCheckin(userId, companyId);
      if(verify.autoCheckout){
        const { id, company } = verify;
        await service.doCheckout(userId, company, id);
      }

    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
