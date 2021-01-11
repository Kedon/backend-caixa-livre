'use strict';

const service = require('./service');
const uuidv1 = require('uuid/v1');


module.exports.ads = async (req, res) => {
  const admin = req.loggedUser.id
  console.log(admin)
  try {
    let result = await service.ads(admin);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}