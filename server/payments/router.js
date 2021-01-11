'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.payment);
router.put('/', (req, res, next) => AUTH.validate(req, res, next), controller.updatePayment);
router.get('/success', controller.paymentSuccess);
router.get('/pending', controller.paymentPending);
router.get('/failure', controller.paymentFailure);
router.get('/notification', controller.paymentNotification);
module.exports = router;
