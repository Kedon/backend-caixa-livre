'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', controller.categories);
router.get('/:id', controller.category);
router.get('/departments/:id/', controller.categoryDepartments);


module.exports = router;
