'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.post('/', controller.createCompany);
router.put('/', controller.updateCompany);
router.get('/', controller.listCompanies);
router.put('/status', controller.changeCompanyStatus);
router.get('/checkins', (req, res, next) => AUTH.validate(req, res, next), controller.checkins);
router.get('/checkins/:companyId', (req, res, next) => AUTH.validate(req, res, next), controller.checkin);
router.post('/checkins/:companyId/:action', (req, res, next) => AUTH.validate(req, res, next), controller.doCheck);

module.exports = router;
