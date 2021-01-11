'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.status);
router.post('/users', (req, res, next) => AUTH.validate(req, res, next), controller.statusUsers);
router.post('/', (req, res, next) => AUTH.validate(req, res, next), controller.setStatus);

module.exports = router;
