'use strict';

const service = require('./service');
const uuidv1 = require('uuid/v1');


module.exports.categories = async (req, res) => {
  //try {
    let result = await service.categories();
    return res.json(result);
  /*} catch (err) {
    return res.status(500).json(err);
  }*/
}

module.exports.category = async (req, res) => {
  const { id } = req.params
  try {
    let result = await service.category(id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.categoryDepartments = async (req, res) => {
  const { id } = req.params
  try {
    let result = await service.categoryDepartments(id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

