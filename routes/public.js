var express = require('express');


const publicController = require('../controllers/publicController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get([
    '/',
    '/personal'
],publicController.index);



module.exports = router;
