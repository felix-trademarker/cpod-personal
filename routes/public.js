var express = require('express');


const publicController = require('../controllers/publicController')
const apiController = require('../controllers/apiController')


var router = express.Router();

// TESTERS ============================
// ====================================

router.get([
    '/personal/:email'
],publicController.index);

router.get([
    '/personal/order-form/:email'
],publicController.orderForm);


router.get([
    '/personal/account/change'
],publicController.diffAccount);
// router.get([
//     '/personal/form/checkout'
// ],publicController.checkout);

router.get([
    '/personal/login/:email'
],publicController.login);

router.get([
    '/personal/thankyou/test'
],publicController.thankyou);

router.get([
    '/personal/thankyou/:orderNo'
],publicController.thankyou);

router.post([
    '/personal/thankyou-update/:orderNo'
],publicController.thankyouSubmit);

router.post([
    '/personal/placeorder'
],publicController.placeorder);


// ================ API ===============
// ====================================
router.get([
    '/personal/api/v1/checkEmail/:email'
],apiController.checkEmail);

router.get([
    '/personal/api/v1/encode/:email'
],apiController.encodeEmail);

router.get([
    '/personal/api/v1/decode/:email'
],apiController.decodeEmail);



module.exports = router;
