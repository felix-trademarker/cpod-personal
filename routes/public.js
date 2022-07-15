var express = require('express');


const publicController = require('../controllers/publicController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get([
    '/',
    '/personal'
],publicController.index);

router.get([
    '/personal/thankyou/:orderNo'
],publicController.thankyou);

router.post([
    '/personal/placeorder'
],publicController.placeorder);



module.exports = router;
