'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', controller.packages);
module.exports = router;
