'use strict';

const service = require('./service');

module.exports.adicionar = async (req, res) => {
  if (!req.body.nome) return res.status(400).json('Nome do condomínio não informado');
  
  try {
    let result = await service.inserir(req.body.nome, req.body.descricao, req.body.id_administradora);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



module.exports.atualizar = async (req, res) => {
  if (!req.body.id) return res.status(400).json('O ID do condominio não foi informado.');
  if (!req.body.nome) return res.status(400).json('O nome não foi informado.');

  try {
    let result = await service.atualizar(req.body.id, req.body.nome, req.body.descricao, req.body.id_administradora);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}

module.exports.listar = async (req, res) => {
  try {
    let result = await service.listar(req.body.id_administradora);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.listarCondominio = async (req, res) => {
  if (!req.body.id) return res.status(400).json({
    status: 'ERROR',
    message: 'Condimínio não informado'});
  
  try {
    let result = await service.listarCondominio(req.body.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
