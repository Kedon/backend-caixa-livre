'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

/**
 * Do like in a user
 */

module.exports.products = (admin, perPage, offset, section, department, startsWith, alsoHave, notHave, orderBy, priceFrom, priceTo, searchTerm) => {
    const baseUrl = `https://static.caixalivre.net/images/webp/`
    let where = []
    if(searchTerm && searchTerm.trim().length > 0 ){
        where.push(`Prd_Produtos_Local.ean IN (SELECT ean FROM Prd_Produtos WHERE produto LIKE '%${searchTerm}%') `)
     }
 
    if(department && department.length > 0 ){
        where.push(`Prd_Produtos_Local.id_departamento = '${department}' `)
    }

    if(section && section.length > 0 ){
        where.push(`Prd_Produtos_Local.area = '${section}' `)
    }

    
    if(Number(priceFrom) && Number(priceTo) && (Number(priceFrom) <= Number(priceTo))) {
        where.push(`Prd_Produtos_Local.preco_tabela BETWEEN ${Number(priceFrom)} AND ${Number(priceTo)}`);
    }
    
    //sql = sql + `AND Prd_Produtos_Local.status = 1 `
    let group = `GROUP BY Prd_Produtos.id_produto `;
    let order = []
    if(orderBy === 'lowerPrice') {
        order.push(`ORDER BY Prd_Produtos_Local.preco_tabela ASC `);
    } else if (orderBy === 'higherPrice') {
        order.push(`ORDER BY Prd_Produtos_Local.preco_tabela DESC `);
    } else if(orderBy === 'salesLowerPrice'){
        order.push(`ORDER BY es.estoques DESC , Prd_Produtos_Local.preco_tabela ASC `);
    } else if(orderBy === 'salesHigherPrice'){
        order.push(`ORDER BY es.estoques DESC , Prd_Produtos_Local.preco_tabela DESC `);
    } else {
        order.push(`ORDER BY Prd_Produtos.id_produto DESC `);
    }

   const pagination = `LIMIT ${parseInt(offset)},${parseInt(perPage)} `

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
    LEFT JOIN ( SELECT sum(estoque) AS estoques, ean FROM Prd_Produtos_Estoques WHERE ${admin} GROUP BY ean ) es ON (Prd_Produtos.ean = es.ean)
    LEFT JOIN ( SELECT sum(qtde) AS vendas, ean FROM Pds_Pedidos_Itens WHERE ${admin} AND token IN (SELECT token FROM Pds_Pedidos WHERE status != 'cancelado') GROUP BY ean ) ve ON (Prd_Produtos.ean = ve.ean)
    WHERE Prd_Produtos_Local.admin = ${admin} ${where.length > 0 ? ' AND ' +where.join(' AND ') : ''} ${group} ${order} ${pagination}`;
    
    const total = `SELECT count(*) as registers, min(preco_tabela) AS min_price, max(preco_tabela) as max_price, min(preco_prom) AS min_price_prom, max(preco_prom) as max_price_prom FROM Prd_Produtos_Local ${where.length > 0 ? ' WHERE ' +where.join(' AND ') : ''} AND ean IN (SELECT ean FROM Prd_Produtos_Local WHERE admin = ${admin} AND status = 1)`;
    const sections = `SELECT id, area, slug FROM Prd_Area WHERE id IN (SELECT area FROM Prd_Produtos_Local ${where.length > 0 ? ' WHERE ' +where.join(' AND ') : ''} )`
    const departments = `SELECT id_departamento, departamento, slug FROM Prd_Departamentos WHERE id_departamento IN (SELECT id_departamento FROM Prd_Produtos_Local ${where.length > 0 ? ' WHERE ' +where.join(' AND ') : ''} )`
    
    return new Promise(async (resolve, reject) => {
        try {
            //VERIFICA A QUANTIDADE TOTAL DE REGISTROS
            let [totalCount] = await database.query(total, {replacements: {}});

            //SEÇÕES INCLUÍDAS NAS BUSCAS
            let [sectionsIncluded] = await database.query(sections, {replacements: {}});

            //DEPARTAMENTOS INCLUÍDOS NAS BUSCAS
            let [departmentsIncluded] = await database.query(departments, {replacements: {}});

            let [rows, metadata] = await database.query(select, {});
            

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há produtos para os filtros selecionados'
                });

            return resolve({
                status: 'OK',
                message: 'Listagem de produtos',
                basePath: baseUrl,
                data: rows,
                totalRows: totalCount[0].registers,
                sections: sectionsIncluded,
                departments: departmentsIncluded,
                prices: {
                    minPrice: totalCount[0].min_price_prom ? totalCount[0].min_price_prom : totalCount[0].min_price,
                    maxPrice: totalCount[0].max_price_prom ? totalCount[0].max_price_prom : totalCount[0].max_price
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}


module.exports.product = (admin, ean) => {
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
    LEFT JOIN ( SELECT sum(estoque) AS estoques, ean FROM Prd_Produtos_Estoques WHERE ${admin} GROUP BY ean ) es ON (Prd_Produtos.ean = es.ean)
    LEFT JOIN ( SELECT sum(qtde) AS vendas, ean FROM Pds_Pedidos_Itens WHERE ${admin} AND token IN (SELECT token FROM Pds_Pedidos WHERE status != 'cancelado') GROUP BY ean ) ve ON (Prd_Produtos.ean = ve.ean)
    WHERE Prd_Produtos_Local.admin = ${admin}`;

    const section = `SELECT id, area, slug FROM Prd_Area WHERE id IN (SELECT area FROM Prd_Produtos_Local WHERE ean = '${ean}' )`
    const department = `SELECT id_departamento, departamento, slug FROM Prd_Departamentos WHERE id_departamento IN (SELECT id_departamento FROM Prd_Produtos_Local WHERE ean = '${ean}' )`


    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(`${select} AND Prd_Produtos_Local.ean = '${ean}'`, {});
            
            //SELECIONA OS PRODUTOS RELACIONADOS
            let [relateds] = await database.query(`${select} AND Prd_Produtos_Local.area = ${rows[0].area} ORDER BY ve.vendas DESC LIMIT 12`, {});

            //SEÇÕES INCLUÍDAS NAS BUSCAS
            let [sectionIncluded] = await database.query(section, {replacements: {}});

            //DEPARTAMENTOS INCLUÍDOS NAS BUSCAS
            let [departmentIncluded] = await database.query(department, {replacements: {}});

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não foi possível curtir usuário'
                });

            return resolve({
                status: 'OK',
                message: 'Listagem de produtos',
                basePath: baseUrl,
                data: rows,
                section: sectionIncluded,
                department: departmentIncluded,
                relatedItems: relateds
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}

module.exports.highlights = (admin) => {
    const baseUrl = `https://static.caixalivre.net/images/webp/`
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                    `SELECT c.titulo_itens_home,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            "produto", p.produto, 
                            "resumo", p.resumo, 
                            "slug", p.slug, 
                            "produto", p.produto, 
                            "imagem", p.imagem, 
                            "imagem", p.imagem, 
                            "token", p.token,
                            "preco_prom", p.preco_prom,
                            "preco_tabela", p.preco_tabela,
                            "id_marca", p.id_marca,
                            "slug_marca", p.slug_marca,
                            "promo_price", p.promo_price,
                            "estoques", p.estoques,
                            "vendas", p.vendas
                        )
                    ) as products
                    FROM Vds_Config c 
                    LEFT JOIN ( SELECT Prd_Produtos.id_produto as id,
                        Prd_Produtos.produto,
                        Prd_Produtos.resumo,
                        Prd_Produtos.slug,
                        Prd_Produtos.imagem,
                        Prd_Produtos.token,
                        Prd_Produtos_Local.preco_prom,
                        Prd_Produtos_Local.preco_tabela,
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
                        LEFT JOIN ( SELECT sum(estoque) AS estoques, ean FROM Prd_Produtos_Estoques WHERE admin = ${admin} GROUP BY ean ) es ON (Prd_Produtos.ean = es.ean)
                        LEFT JOIN ( SELECT sum(qtde) AS vendas, ean FROM Pds_Pedidos_Itens WHERE admin = ${admin} AND token IN (SELECT token FROM Pds_Pedidos WHERE status != 'cancelado') GROUP BY ean ) ve ON (Prd_Produtos.ean = ve.ean)
                        WHERE Prd_Produtos_Local.admin = ${admin}
                        AND Prd_Produtos_Local.status = 1 AND Prd_Produtos_Local.home = 1 
                        LIMIT 10) p ON (1=1)
                    WHERE c.itens_home = 'true' AND c.admin = ${admin}`, 
                    {
                        replacements: {}
                    });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Não há banners disponíveis',
                    data: []
                });

            return resolve({
                status: 'OK',
                message: 'Lista de banners',
                basePath: baseUrl,
                data: rows
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}

