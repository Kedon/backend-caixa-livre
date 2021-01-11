'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database');
const { now } = require('moment');

/**
 * Do like in a user
 */

module.exports.addToCart = (admin, ean, quantity) => {
    const baseUrl = `https://static.caixalivre.net/images/webp/`

   const select = `SELECT 
    Prd_Produtos.id_produto as id,
    Prd_Produtos.ean as ean,
    Prd_Produtos.produto,
    Prd_Produtos.resumo,
    Prd_Produtos.slug,
    Prd_Produtos.imagem,
    Prd_Produtos.token,
    Prd_Produtos_Local.preco_prom,
    Prd_Produtos_Local.preco_tabela,
    Prd_Produtos_Local.area,
    Prd_Produtos_Local.id_departamento,
    Prd_Marcas.id_marca,
    Prd_Marcas.marca,
    Prd_Marcas.slug AS slug_marca,
    Prm_Campanhas_Produtos.promo_price,
    es.estoques,
    ve.vendas
    FROM Prd_Produtos
    LEFT JOIN Prd_Produtos_Local USING (ean)
    LEFT JOIN Prd_Marcas ON Prd_Marcas.id_marca = Prd_Produtos.id_marca
    LEFT JOIN Prm_Campanhas_Produtos ON Prm_Campanhas_Produtos.ean = Prd_Produtos.ean
        AND Prm_Campanhas_Produtos.uuid
        IN (SELECT uuid FROM Prm_Campanhas WHERE (start <= Now() AND end >= Now()))
    LEFT JOIN ( SELECT sum(estoque) AS estoques, ean FROM Prd_Produtos_Estoques WHERE ${admin.id} GROUP BY ean ) es ON (Prd_Produtos.ean = es.ean)
    LEFT JOIN ( SELECT sum(qtde) AS vendas, ean FROM Pds_Pedidos_Itens WHERE ${admin.id} AND token IN (SELECT token FROM Pds_Pedidos WHERE status != 'cancelado') GROUP BY ean ) ve ON (Prd_Produtos.ean = ve.ean)
    WHERE Prd_Produtos_Local.admin = ${admin.id} AND Prd_Produtos_Local.ean = ${ean}`;

    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(`${select} AND Prd_Produtos_Local.ean = '${ean}'`, {});
            
            //VERIFICA SE O ESTABELECIMENTO GERENCIA ESTOQUE
            let [manageStock] = await database.query(`SELECT ger_estoque FROM Vds_Config WHERE admin = ${admin.id} AND ger_estoque = 'true'`, {});
            const stockManagement = manageStock.length > 0 ? true : false
            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não foi possível curtir usuário'
                });

            
                console.log(admin)

            if(stockManagement && rows[0].estoques === 0){
                console.log('estoque indisponível')
                return resolve({
                    status: 'ERR',
                    message: 'Estoque indisponível',
                    basePath: baseUrl,
                    manageStock: stockManagement,
                    data: [],
                });
            } else if(stockManagement && rows[0].estoques < quantity){
                return resolve({
                    status: 'ERR',
                    message: `Quantidade indisponível, adiciona no máximo ${rows[0].estoques} itens.`,
                    basePath: baseUrl,
                    manageStock: stockManagement,
                    data: [],
                });
            } else {
                const item = rows[0]

                //I

                return resolve({
                    status: 'OK',
                    message: `Item adicionado com sucesso ao carrinho`,
                    basePath: baseUrl,
                    manageStock: stockManagement,
                    order: {
                        id: '572B932A-FAAA-4379-B3B1-49C7050E97ED',
                        created_at: moment(Date()).format('YYYY-MM-DD HH:mm:ss'),
                    },
                    data: item,
                });
            }

            

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}
