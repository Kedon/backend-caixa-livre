'use strict';

const service = require('./service');

module.exports.adicionar = async (req, res) => {
  if (!req.body.id_criador) return res.status(400).json({
    status: 'FAIL',
    message: 'Criador do orçamento não  foi informado'
  });
  if (!req.body.id_condominio) return res.status(400).json({
    status: 'FAIL',
    message: 'Condomínio não foi informado'
  });
  if (!req.body.nome) return res.status(400).json({
    status: 'FAIL',
    message: 'Dê um nome para o seu orçamento'
  });

  try {
    let result = await service.inserir(req.body.id_criador, req.body.id_condominio, req.body.nome);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.adicionarItens = async (req, res) => {
  if (!req.body.id_criador) return res.status(400).json({
    status: 'FAIL',
    message: 'Criador do orçamento não  foi informado'
  });
  if (!req.body.id_condominio) return res.status(400).json({
    status: 'FAIL',
    message: 'Condomínio não foi informado'
  });
  if (!req.body.id_orcamento) return res.status(400).json({
    status: 'FAIL',
    message: 'Orçamento não foi informado'
  });
  if (!req.body.nome) return res.status(400).json({
    status: 'FAIL',
    message: 'Nome do item não foi informado'
  });
  try {
    let result = await service.inserirItens(req.body.id_criador, req.body.id_condominio, req.body.id_orcamento, req.body.unidade_medida, req.body.nome, req.body.quantidade);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {
  if (!req.body.id_condominio) return res.status(400).json({
    status: 'FAIL',
    message: 'Condomínio não foi informado'
  });
  try {
    let result = await service.listar(req.body.id_condominio, req.body.id_criador);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarItens = async (req, res) => {
  if (!req.body.id_orcamento) return res.status(400).json({
    status: 'FAIL',
    message: 'Orçamento não foi informado'
  });
  try {
    let result = await service.listarItens(req.body.id_orcamento);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
function delay() {
  return new Promise(resolve => setTimeout(resolve,3000));
}
async function delayLog(item) {
  await delay();
  console.log(item)
}


module.exports.listarOrcamento = async (req, res) => {
  if (!req.body.id_orcamento) return res.status(400).json({
    status: 'FAIL',
    message: 'Orçamento não foi informado'
  });
  try {
    let result = await service.listarOrcamento(req.body.id_orcamento);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.adicionarRespostasArray = async (req, res) => {
   for(const item of req.body.respostas) {
    try {
      await service.inserirRespostas(item.id_enquete, item.id_opcao, item.id_pergunta, item.id_criador, item.id_usuario, item.id_condominio, item.id_admnistradora, item.respostas)
    } catch (err) {
      return res.status(500).json(err);
    } 
    console.log('Done')
  }
  return res.json({
    status: 'OK',
    message: 'Respostas salvas com sucesso.'});
}
