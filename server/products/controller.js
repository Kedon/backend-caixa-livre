'use strict';

const service = require('./service');
const userService = require('../users/service');
const uuidv1 = require('uuid/v1');


module.exports.products = async (req, res) => {
  const {  perPage, offset, section, department, startsWith, alsoHave, notHave, orderBy, priceFrom, priceTo, searchTerm } = req.query
  const admin = req.loggedUser.id
  try {
    let result = await service.products(admin, perPage, offset, section, department, startsWith, alsoHave, notHave, orderBy, priceFrom, priceTo, searchTerm);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.product = async (req, res) => {
  const { ean } = req.params
  const admin = req.loggedUser.id
  console.log(ean)

  try {
    let result = await service.product(admin, ean);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.productUpdate = async (req, res) => {
  const { ean } = req.params
  const { categoria } = req.query
  
  try {
    let result = await service.productUpdate(ean, categoria);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.highlights = async (req, res) => {
  const admin = req.loggedUser.id
  try {
    let result = await service.highlights(admin);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
