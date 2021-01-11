'use strict';

const service = require('./service');
const uuidv1 = require('uuid/v1');


module.exports.areas = async (req, res) => {
  const admin = req.loggedUser.id
  console.log(admin)
  try {
    let result = await service.areas(admin);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.area = async (req, res) => {
  const admin = req.loggedUser.id
  const { id } = req.params
  console.log(req)
  try {
    let result = await service.area(admin,id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.excerpt = async (req, res) => {
  const admin = req.loggedUser.id
  const { id } = req.params
  console.log(req)
  try {
    let result = await service.excerpt(admin,id);
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
