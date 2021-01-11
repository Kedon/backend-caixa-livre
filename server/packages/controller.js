'use strict';

const service = require('./service');

module.exports.packages = async (req, res) => {
  const { type } = req.params
  try {
    let result = await service.packages();
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
