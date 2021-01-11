'use strict';

const service = require('./service');

module.exports.adicionarEnquete = async (req, res) => {
  if (!req.body.nome) return res.status(400).json({
    status: 'FAIL',
    message: 'Nome da enquete não foi informado'
  });
  if (!req.body.id_criador) return res.status(400).json({
    status: 'FAIL',
    message: 'Criador da enquete não foi informado'
  });
  if (!req.body.perfil_criador) return res.status(400).json({
    status: 'FAIL',
    message: 'Criador não possui  um perfil de acesso. Por favor entrar em contato com o administradfor do sistema'
  });

  try {
    let result = await service.inserirEnquete(req.body.nome, req.body.descricao, req.body.data_inicio, req.body.data_fim, req.body.id_criador, req.body.perfil_criador);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.adicionarRespostas = async (req, res) => {
  if (!req.body.id_enquete) return res.status(400).json({
    status: 'FAIL',
    message: 'A enquete não foi informada'
  });
  if (!req.body.id_opcao) return res.status(400).json({
    status: 'FAIL',
    message: 'A opção de resposta não foi informada'
  });
  if (!req.body.id_pergunta) return res.status(400).json({
    status: 'FAIL',
    message: 'A pergunta não foi informada'
  });
  if (!req.body.id_criador) return res.status(400).json({
    status: 'FAIL',
    message: 'Criador não informado'
  });
  if (!req.body.id_usuario) return res.status(400).json({
    status: 'FAIL',
    message: 'Qual usuário está respondendo essa enquete? Ele não foi informado!'
  });
  if (!req.body.respostas || req.body.respostas.length <= 0) return res.status(400).json({
    status: 'FAIL',
    message: 'Resposta não'
  });

  try {
    let result = await service.inserirEnquete(req.body.nome, req.body.descricao, req.body.data_inicio, req.body.data_fim, req.body.id_criador, req.body.perfil_criador);
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
  /* try {
    // let result = await service.inserirEnquete(req.body.nome, req.body.descricao, req.body.data_inicio, req.body.data_fim, req.body.id_criador, req.body.perfil_criador);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }*/
}

module.exports.adicionarPerguntas = async (req, res) => {
  if (!req.body.label) return res.status(400).json('Sua pergunta não tem um label');
  if (!req.body.tipo) return res.status(400).json('Tipo da resposta não informado');
  if (!req.body.id_enquete) return res.status(400).json('Enquete não informada');

  try {
    let result = await service.inserirPerguntas(req.body.label, req.body.descricao, req.body.min, req.body.max, req.body.id_enquete, req.body.tipo, req.body.subtipo, req.body.requerido);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
module.exports.adicionarOpcoes = async (req, res) => {
  if (!req.body.label) return res.status(400).json('Sua opcão não tem um label');
  if (!req.body.id_pergunta) return res.status(400).json('Pergunta não informada');

  try {
    let result = await service.inserirOpcoes(req.body.label, req.body.descricao, req.body.id_pergunta);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarEnquete = async (req, res) => {
  if (!req.body.id_enquete) return res.status(400).json('Enquete não informada');

  try {
    let result = await service.listarEnquete(req.body.id_enquete);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarPerguntas = async (req, res) => {
  if (!req.body.id_enquete) return res.status(400).json('Enquete não informada');

  try {
    let result = await service.listarPerguntas(req.body.id_enquete);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarEnqueteContinue = async (req, res) => {
  if (!req.body.id_enquete) return res.status(400).json('Enquete não informada');

  try {
    let result = await service.listarEnqueteContinue(req.body.id_enquete);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {
  // if (!req.body.id_enquete) return res.status(400).json('Enquete não informada');

  try {
    let result = await service.listar(req.body.id_condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.listarRespostas = async (req, res) => {
  if (!req.body.id_enquete) return res.status(400).json('Enquete não informada');

  try {
    let result = await service.listarRespostas(req.body.id_enquete);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.atualizarOpcao = async (req, res) => {
  if (!req.body.id) return res.status(400).json('O ID da opcão não foi informado.');
  if (!req.body.label) return res.status(400).json('O label não foi informado.');

  try {
    let result = await service.atualizarOpcao(req.body.id, req.body.label, req.body.descricao);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.atualizarPergunta = async (req, res) => {
  if (!req.body.id) return res.status(400).json('O ID da pergunta não foi informado.');
  if (!req.body.label) return res.status(400).json('O label não foi informado.');

  try {
    let result = await service.atualizarPergunta(req.body.id, req.body.label, req.body.descricao, req.body.min, req.body.max, req.body.tipo, req.body.subtipo, req.body.requerido);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}