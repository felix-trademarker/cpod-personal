const stripe = require("stripe")(process.env.SKEY,{apiVersion: '2020-08-27'});

var Model = require('./../models/_model')

exports.checkEmail = async function(req, res, next) {

    // console.log(req.params.email);

    const customers = await stripe.customers.search({
        query: 'email:"'+req.params.email+'"',
    });

    if (customers && customers.data.length <= 0) {
        res.json({
            status:false,
            message:"Sorry! This promo is only for existing customers!"
        });
    } else {

        let customerId = customers.data[0].id
        let customerSource = customers.data[0].default_source
        console.log(customerId, customerSource);
        const card = await stripe.customers.retrieveSource(
            "'"+customerId+"'",
            "'"+customerSource+"'"
        );

        let data = customers.data[customers.data.length - 1]
        data.card = card

        res.json({
            status:true,
            message:"Customer Exists!",
            data: data
        });
    }

    

}