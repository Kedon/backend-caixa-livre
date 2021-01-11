'use strict';

const service = require('./service');
const uuidv1 = require('uuid/v1');


module.exports.promotions = async (req, res) => {
  const admin = req.loggedUser.id
  console.log(admin)
  try {
    let result = await service.promotions(admin);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}