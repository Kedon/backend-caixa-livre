'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();
/**
 * @swagger
 *
 * /login:
 *   post:
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: Username to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.listar);

// router.post('/adicionar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.adicionar);
router.post('/adicionar', controller.adicionar);
router.post('/listar', controller.listar);
router.post('/listarAdministradora', controller.listarAdministradora);
router.post('/atualizar', controller.atualizar);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

module.exports = router;