'use strict'
const multer = require('multer');
const AUTH = require('../shared').AUTH;
const router = require('express').Router();

const controller = require('./controller');
const gcsMiddlewares = require('../middlewares/google-cloud-storage')

const multer2 = multer({
    storage: multer.MemoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Maximum file size is 10MB
    },
});

/**
 * to save in S3 storage, the file must have a path
 */
var storage = multer.diskStorage({ //multers disk storage settings
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});



router.post('/', multer2.single('file'),gcsMiddlewares.sendUploadToGCS,
    (req, res, next) => {
        if (req.file && req.file.gcsUrl) {
            return res.send(
                {
                    status: 'OK',
                    message: 'Imagem salva com sucesso',
                    data: {
                        url: req.file.gcsUrl
                    }
                }

            );
        }

        return res.status(500).send('Unable to upload');
    },
);

router.post('/file', multer({ storage: storage }).single('file'), controller.uploadImage);
router.post('/files', controller.uploadBase64Array);

module.exports = router;