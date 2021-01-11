'use strict';

const service = require('./service');
const produtosService = require('../produtos/service');

module.exports.adicionar = async (req, res) => {
  if (!req.body.numero) return res.status(400).json('O numero não foi informado.');

  try {
    let result = await service.inserir(req.body.idGrupo, req.body.idCliente, req.body.numero, req.body.assunto, req.body.descricao, req.body.dataDistribuicao, req.body.classe, req.body.orgaoJulgador, req.body.controle, req.body.juiz, req.body.valorAcao);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.atualizar = async (req, res) => {
  if (!req.body.idProcesso) return res.status(400).json('O ID do processo não foi informado.');
  if (!req.body.numero) return res.status(400).json('O numero não foi informado.');

  try {
    let result = await service.atualizar(req.body.idProcesso, req.body.idGrupo, req.body.idCliente, req.body.numero, req.body.assunto, req.body.descricao, req.body.dataDistribuicao, req.body.classe, req.body.orgaoJulgador, req.body.controle, req.body.juiz, req.body.valorAcao);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.pesquisar = async (req, res) => {
  if (!req.body.pesquisa) return res.status(400).json('A pesquisa não foi informada.');

  try {
    let result = await service.pesquisar(req.body.pesquisa);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.consultar = async (req, res) => {
  if (!req.body.admin) return res.status(400).json('Código da loja não informado');

  try {
    let result = await service.consultar(req.body.admin, req.body.admin);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.listarCategorias = async (req, res) => {
    if (!req.body.depto) return res.status(400).json('Departamento não informado');

  try {
    let result = await service.listarCategorias(req.body.depto);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.listarDepartamentos = async (req, res) => {
  // if (!req.body.admin) return res.status(400).json('Código da loja não informado');

  try {
    let result = await service.listarDepartamentos();
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.listarLojas = async (req, res) => {
  // if (!req.body.admin) return res.status(400).json('Código da loja não informado');
  try {
    let result = await service.listarLojas(req.body.lat, req.body.lng);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.adicionarPedido = async (req, res) => {
  if (!req.body.admin) return res.status(400).json('O numero do estabelecimento não foi informado.');

  try {
    let result = await service.inserirPedido(req.body.admin, req.body.cliente);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



module.exports.produtosProximos = async (req, res) => {
  // if (!req.body.admin) return res.status(400).json('Código da loja não informado');
  try {
    let result = await service.produtosProximos(req.body.lat, req.body.lng);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.adicionarProdutoPedido = async (req, res) => {
  if (!req.body.admin) return res.status(400).json('O numero do estabelecimento não foi informado.');
  if (!req.body.produto) return res.status(400).json('Nenhum produto selecionado');
  if (!req.body.token) return res.status(400).json('Nenhum pedido em aberto');
  if (!req.body.qtde) return res.status(400).json('Quantidade não informada');

  try {
    let result = await service.inserirProdutoPedido(req.body.admin, req.body.produto, req.body.token, req.body.qtde);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {
  if (!req.body.tokenPayload.payload || !req.body.tokenPayload.payload.idUsuario)
    return res.status(400).json('A autenticação não é valida.');

  try {
    let grupos = await gruposService.retornarGruposUsuario(req.body.tokenPayload.payload.idUsuario);
    let acessoRestrito = false;

    if (grupos && grupos.status == 'OK') {
      acessoRestrito = true;
      for (let g of grupos.data.grupos) {
        if (!g.restringirAcesso)
          acessoRestrito = false;
      }

      grupos = grupos.data.grupos.map(g => g.idGrupo);
    }

    let result = await service.listar(acessoRestrito ? grupos : undefined);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarPorCliente = async (req, res) => {
  if (!req.body.idCliente) return res.status(400).json('O ID do cliente não foi informado.');

  try {
    let result = await service.listarPorCliente(req.body.idCliente);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.recuperarPorId = async (req, res) => {
  if (!req.body.idProcesso) return res.status(400).json('O ID do processo não foi informado.');

  try {
    let result = await service.recuperarPorId(req.body.idProcesso);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}