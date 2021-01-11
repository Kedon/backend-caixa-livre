'use strict';

const service = require('./service');
const userService = require('../users/service');
const uuidv1 = require('uuid/v1');


module.exports.addToCart = async (req, res) => {
  const {  ean, quantity } = req.query
  const admin = req.loggedUser
  try {
    let result = await service.addToCart(admin, ean, quantity);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.cart = async (req, res) => {
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
