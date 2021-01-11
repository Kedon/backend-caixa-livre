'use strict'

const moment = require('moment');
const uuidv1 = require('uuid/v1');
const LOGS = require('../shared').LOGS;
const database = require('../database/database');


module.exports.consultar = (admin) => {
  return new Promise(async (resolve, reject) => {
    let query = 'SELECT * FROM prd_produtos WHERE';

    if (admin)
      query += ' admin = :admin'
    try {
      let [rows, metadata] = await database.query(query, {
        replacements: {
          admin: admin ? admin : null
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Produtos não encontrados.',
          data: {
            data: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Produtos encontrados.',
        data: rows
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.listarCategorias = (depto) => {
  return new Promise(async (resolve, reject) => {
    let query = `SELECT 
    prd_departamentos.id AS deptoId, 
    prd_departamentos.departamento,
            prd_categorias.categoria,
            prd_categorias.tipo_prod,
            prd_categorias.qtde
            FROM estabelecimentos.prd_departamentos, estabelecimentos.prd_categorias
            WHERE prd_departamentos.id =  prd_categorias.departamento`;

    if (depto)
      query += ' AND prd_departamentos.id= :depto'
    try {
      let [rows, metadata] = await database.query(query, {
        replacements: {
          depto: depto ? depto : null
        }
      });

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Categorias não encontradas.',
          data: {
            data: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Categorias encontradas.',
        data: rows
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.listarDepartamentos = () => {
  return new Promise(async (resolve, reject) => {
    let query = 'SELECT * FROM prd_departamentos';
    try {
      let [rows, metadata] = await database.query(query, {});

      if (!rows || rows.length <= 0)
        return resolve({
          status: 'WARN',
          message: 'Departamentos não encontrados.',
          data: {
            data: []
          }
        });

      return resolve({
        status: 'OK',
        message: 'Departamentos encontrados.',
        data: rows
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.inserirPedido = (admin, cliente='') => {
  console.log(admin)
  return new Promise(async (resolve, reject) => {
    let token = uuidv1();
   
    try {
      let [rows, metadata] = await database.query('INSERT INTO pds_pedidos (admin, token, data, cliente, franquia, tipo) VALUES (:admin, :token, :data, :cliente, :franquia, :tipo)', {
        replacements: {
          admin,
          token,
          data: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          cliente: cliente ? cliente : '',
          franquia: 'matriz',
          tipo: 'compra'
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao adicionar.'
        });

      return resolve({
        status: 'OK',
        message: 'Adicionado com sucesso.',
        data: {
          token
        }
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.',
        erro: token,
        data: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      });
    }
  });
}

module.exports.inserirProdutoPedido = (admin, produto, token, qtde, departamento, categoria, marca, largura, altura, profundidade, peso, tipo) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [rows, metadata] = await database.query('INSERT INTO pds_pedidos_itens (admin, produto, departamento, categoria, marca, largura, altura, profundidade, peso, qtde, tipo, token, franquia) VALUES (:admin, :produto, :departamento, :categoria, :marca, :largura, :altura, :profundidade, :peso, :qtde, :tipo, :token, :franquia)', {
        replacements: {
          admin,
          produto,
          token,
          qtde,
          departamento: departamento ? departamento : '',
          categoria: categoria ? categoria : '',
          marca: marca ? marca : '',
          largura: largura ? largura : '',
          altura: altura ? altura : '',
          profundidade: profundidade ? profundidade : '',
          peso: peso ? peso : '',
          tipo: tipo ? tipo : '',
          franquia: 'matriz'
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao adicionar.'
        });

      return resolve({
        status: 'OK',
        message: 'Adicionado com sucesso.',
        data: {
          token
        }
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.',
        erro: token,
        data: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      });
    }
  });
}

module.exports.listarLojas = (lat, lng) => {
  return new Promise(async (resolve, reject) => {
    let query = `SELECT id, razao_social,nome_fantasia,lat, lng`;
    if(lat && lng) {
      query +=  `,(6371 * acos  (
         cos ( radians(:lat) )
         * cos( radians( lat ) )
         * cos( radians( lng ) - radians(:lng) )
         + sin ( radians(:lat) )
         * sin( radians( lat ) ) ) ) AS distance
   FROM estabelecimentos.empresas
   HAVING distance <= 5
   ORDER BY distance
   LIMIT 0 , 20;`
    } else {
      query += ` FROM estabelecimentos.empresas LIMIT 0 , 20;`
    }
    try {
      let [rows, metadata] = await database.query(query, {
        replacements: {
          lat: lat ? lat : '',
          lng: lng ? lng: ''
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao listar lojas.'
        });

      return resolve({
        status: 'OK',
        message: 'Lojas listadas com sucesso',
        data: rows
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}
module.exports.produtosProximos = (lat, lng) => {
  return new Promise(async (resolve, reject) => {
    let query = `SELECT prd_produtos.id, 
    prd_produtos.codigo,  
            prd_produtos.produto, 
            prd_produtos_preco.preco,
            prd_produtos_preco.preco_normal,
            prd_produtos.marca, 
            prd_produtos.descricao_html, 
            prd_produtos.resumo, 
            prd_produtos.altura, 
            prd_produtos.largura, 
            prd_produtos.profundidade, 
            prd_produtos.peso_bruto, 
            prd_produtos.peso_liquido, 
            prd_produtos.admin, 
            prd_produtos.frete_gratis,
            prd_produtos.admin, 
            prd_produtos.departamento,
            prd_produtos.categoria,
            empresas.id,
            empresas.num_cnpj, 
            empresas.razao_social,
            empresas.nome_fantasia, 
            empresas.lat, empresas.lng, 
            empresas.cep, 
            empresas.endereco,
            empresas.numero,
            empresas.bairro,
            empresas.cidade,
            empresas.tel1,
            empresas.facebook`;
    if(lat && lng) {
      query +=  `,(6371 * acos  (
        cos ( radians(-23.584076) )
        * cos( radians( lat ) )
        * cos( radians( lng ) - radians(-46.554691) )
        + sin ( radians(-23.584076) )
        * sin( radians( lat ) ) ) ) AS distance
          FROM estabelecimentos.prd_produtos,  estabelecimentos.empresas,  estabelecimentos.prd_produtos_preco
          WHERE prd_produtos.admin =  empresas.id AND  prd_produtos.id =  prd_produtos_preco.produto  HAVING distance <= 5
            ORDER BY distance,   prd_produtos_preco.preco LIMIT 0 , 200;`
    } else {
      query += ` FROM estabelecimentos.prd_produtos,  estabelecimentos.empresas,  estabelecimentos.prd_produtos_preco
      WHERE prd_produtos.admin =  empresas.id AND  prd_produtos.id = prd_produtos_preco.produto ORDER BY prd_produtos_preco.preco LIMIT 0 , 200;`
    }
    try {
      let [rows, metadata] = await database.query(query, {
        replacements: {
          lat: lat ? lat : '',
          lng: lng ? lng: ''
        }
      });

      if (!metadata)
        return resolve({
          status: 'FAIL',
          message: 'Falha ao listar lojas.'
        });

      return resolve({
        status: 'OK',
        message: 'Lojas listadas com sucesso',
        data: rows
      });

    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}