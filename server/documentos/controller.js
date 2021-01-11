'use strict';

const service = require('./service');
const multer = require('multer');

module.exports.adicionar = async (req, res) => {
  // if (!req.body.titulo) return res.status(400).json('titulo do condomínio não informado');
  
  try {
    let result = await service.inserir(req.body.titulo, req.body.url, req.body.descricao, req.body.id_condominio, req.body.id_administradora, req.body.id_usuario, req.body.perfil_usuario);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



module.exports.atualizar = async (req, res) => {
  if (!req.body.idDocumento) return res.status(400).json('O ID do documento não foi informado.');
  if (!req.body.data) return res.status(400).json('A data não foi informada.');
  if (!req.body.titulo) return res.status(400).json('O título não foi informado.');
  if (!req.body.link) return res.status(400).json('O link não foi informado.');

  try {
    let result = await service.atualizar(req.body.idDocumento, req.body.data, req.body.titulo, req.body.descricao, req.body.link);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {
  try {
    let result = await service.listar(req.body.id_condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.recuperarPorId = async (req, res) => {
  if (!req.body.idDocumento) return res.status(400).json('O ID do documento não foi informado.');

  try {
    let result = await service.recuperarPorId(req.body.idDocumento);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.uploadDocumento = async (req, res) => {
  upload(req,res, async function(err){
    console.log(req);
    if(err){
         res.json({error_code:1,err_desc:err});
         return;
    }
    try {
      let result = await service.uploadDocumento(req.file, 'documentos/');
      return res.json(result);
    } catch (err) {
      return res.status(500).json(err);
    }
})
}

var storage = multer.diskStorage({ //multers disk storage settings
  /*create local data to save*/
  /*destination: function (req, file, cb) {
      cb(null, './uploads/');
  },*/
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
  }
});

var upload = multer({ storage: storage }).single('file');