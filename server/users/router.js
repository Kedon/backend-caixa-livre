'use strict'
const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();
const multer = require('multer');

/**
 * to save in S3 storage, the file must have a path
 */
var storage = multer.diskStorage({ //multers disk storage settings
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
  }
});


router.post('/', controller.createUser);
router.post('/:code', controller.createUser);
router.put('/', controller.updateUser);
router.get('/', controller.listUsers);
router.get('/profile/preferences', (req, res, next) => AUTH.validate(req, res, next), controller.getUserPreferences);
router.post('/chat/contacts', controller.userContacts);

router.put('/profile/preferences', (req, res, next) => AUTH.validate(req, res, next), controller.putUserPreferences);
router.get('/profile/configurations', (req, res, next) => AUTH.validate(req, res, next), controller.getUserConfigurations);
router.put('/profile/configurations', (req, res, next) => AUTH.validate(req, res, next), controller.putUserConfigurations);
router.get('/profile/loggedInfo', (req, res, next) => AUTH.validate(req, res, next), controller.getLoggedInfo);
router.post('/profile/changePhoto', (req, res, next) => AUTH.validate(req, res, next), controller.changePhoto);
router.get('/profile/photos', (req, res, next) => AUTH.validate(req, res, next), controller.userPhotos);
router.delete('/profile/deletePhoto', (req, res, next) => AUTH.validate(req, res, next), controller.deletePhoto);
router.get('/profile/userDetails/:userId', (req, res, next) => AUTH.validate(req, res, next), controller.userDetails);

router.put('/status', controller.changeUserStatus);
router.post('/:userId/hobbies', controller.saveHobbies);
router.get('/:userId/hobbies', controller.listUserHobbies);
router.get('/:userId', controller.listUser);
router.get('/userByEmail/:email', controller.listUserByEmail);
router.delete('/:userId', controller.removeUser);
router.delete('/:userId/hobbies', controller.removeUserHobbies);
// router.post('/:userId/images', multer({ storage: storage }).single('file'), controller.saveUserImage);
router.get('/:userId/images', controller.listImages);
router.delete('/:userId/images', controller.removeUserImages);
router.get('/validate', controller.listImages);
router.post('/:userId/images', controller.saveUserArrayImages)


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
