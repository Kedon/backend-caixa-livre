'use strict'
const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();
const multer = require('multer');

router.get('/:cep', (req, res, next) => AUTH.validate(req, res, next), controller.stories);
router.get('/:state/:cep', (req, res, next) => AUTH.validate(req, res, next), controller.ownStorie);
router.get('/:state/:city/:cep', (req, res, next) => AUTH.validate(req, res, next), controller.ownStorie);
router.get('/:state/:city/:cep', (req, res, next) => AUTH.validate(req, res, next), controller.ownStorie);


//
/*SELECT 
	cepbr_bairro.*, 
    cid.*, 
    cepbr_faixa_bairros.*, 
    	 CASE WHEN cid.cep != ''  THEN cid.cep 
        	 WHEN cepbr_faixa_bairros.cep_inicial IS NULL THEN cepbr_faixa_cidades.cep_inicial
             ELSE min(cepbr_faixa_bairros.cep_inicial) END as inicial, 
         CASE WHEN cid.cep != '' THEN cid.cep 
             WHEN cepbr_faixa_bairros.cep_final IS NULL THEN cepbr_faixa_cidades.cep_final
             ELSE max(cepbr_faixa_bairros.cep_final) END as final,
             lat.latitude,
             lng.longitude
            FROM `cepbr_bairro` 
            LEFT JOIN cepbr_cidade cid ON(cepbr_bairro.id_cidade=cid.id_cidade) 
            LEFT JOIN cepbr_faixa_bairros USING(id_bairro) 
            LEFT JOIN cepbr_faixa_cidades ON(cepbr_faixa_cidades.id_cidade=cid.id_cidade) 
            LEFT JOIN cepbr_geo lat ON (lat.cep=(
             (CASE WHEN cid.cep != '' THEN cid.cep
              	WHEN cepbr_faixa_bairros.cep_final IS NULL THEN cepbr_faixa_cidades.cep_final
                ELSE cepbr_faixa_bairros.cep_final END)
            )) 
            LEFT JOIN cepbr_geo lng ON (lng.cep=(
             (CASE WHEN cid.cep != '' THEN cid.cep 
             	WHEN cepbr_faixa_bairros.cep_final IS NULL THEN cepbr_faixa_cidades.cep_final
             	ELSE cepbr_faixa_bairros.cep_final END)
            )) 
            WHERE cepbr_bairro.bairro LIKE '%todos os santos%' OR cid.cidade LIKE '%todos os santos%' 
            GROUP BY cepbr_bairro.id_bairro*/

//SELECT min(latitude), max(longitude) FROM `cepbr_geo` WHERE cep BETWEEN '20720090' AND '20775010 ' AND latitude <> '-' AND longitude <> '-'

module.exports = router;
