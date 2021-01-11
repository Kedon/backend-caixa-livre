'use strict';

const service = require('./service');

module.exports.likes = async (req, res) => {
  const { userId } = req.loggedUser

  try {
    let result = await service.likes(req.loggedUser, req.query.page, req.query.offset);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
