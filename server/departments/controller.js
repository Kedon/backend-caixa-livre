'use strict';

const service = require('./service');
const uuidv1 = require('uuid/v1');


module.exports.departments = async (req, res) => {
  const admin = req.loggedUser.id
  console.log(admin)
  try {
    let result = await service.departments();
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.department = async (req, res) => {
  const { id } = req.params
  try {
    let result = await service.department(id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
