'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.cards);
router.post('/setLocation', (req, res, next) => AUTH.validate(req, res, next), controller.setLocation);
router.post('/rating', (req, res, next) => AUTH.validate(req, res, next), controller.rating);
router.post('/block/:userId', (req, res, next) => AUTH.validate(req, res, next), controller.blockUser);

module.exports = router;
