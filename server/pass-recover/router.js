'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

// router.post('/', controller.createHobbie);
// router.put('/', controller.updateHobbie);
// router.get('/', controller.listHobbies);
// router.delete('/:hobbieId', controller.removeHobbie);
// router.put('/status', controller.changeHobbieStatus);
router.post('/recover', controller.passwordRecover);
router.post('/confirm', controller.confirmPass);

// router.post('/registrarUsuarioCondominio', controller.registrarUsuarioCondominio);
// router.post('/atualizar', controller.atualizar);
// router.post('/listar', controller.listar);
// router.post('/listarUsuario', controller.listarUsuario);

// router.post('/emailEmUso', controller.emailEmUso);
// router.post('/autenticar', controller.autenticar);

// router.post('/alterarSenha', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.alterarSenha);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'ADMINISTRADOR'), controller.listar);
// router.post('/listarUsuario', (req, res, next) => AUTH.validate(req, res, next, 'ADMINISTRADOR'), controller.listarUsuario);

module.exports = router;