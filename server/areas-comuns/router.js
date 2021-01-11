'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.post('/registrar', controller.registrar);
router.post('/registrarUsuarioCondominio', controller.registrarUsuarioCondominio);
router.post('/atualizar', controller.atualizar);
router.post('/listar', controller.listar);
router.post('/reservar', controller.reservar);
router.post('/listarArea', controller.listarArea);
router.post('/listarReservas', controller.listarReservas);
router.post('/listarReserva', controller.listarReserva);

router.post('/emailEmUso', controller.emailEmUso);
router.post('/autenticar', controller.autenticar);

router.post('/alterarSenha', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.alterarSenha);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'ADMINISTRADOR'), controller.listar);
// router.post('/listarUsuario', (req, res, next) => AUTH.validate(req, res, next, 'ADMINISTRADOR'), controller.listarUsuario);

module.exports = router;