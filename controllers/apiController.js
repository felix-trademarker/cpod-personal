const stripe = require("stripe")(process.env.SKEY,{apiVersion: '2020-08-27'});

var Model = require('./../models/_model')

exports.checkEmail = async function(req, res, next) {

    // console.log(req.params.email);

    const customers = await stripe.customers.search({
        query: 'email:"'+req.params.email+'"',
    });

    console.log(customers.data)
    if (customers && customers.data.length <= 0) {
        res.json({
            status:false,
            message:"Sorry! This promo is only for existing customers!"
        });
    } else {

        let customerId = customers.data[customers.data.length - 1].id
        // let customerSource = customers.data[customers.data.length - 1].default_source
        console.log(customers.data[customers.data.length - 1]);

        const cards = await stripe.customers.listSources(
            customerId,
            {object: 'card', limit: 1}
        );

        if (cards && cards.length > 0) {
            data.card = cards[0]
        }

        console.log(cards);

        let data = customers.data[customers.data.length - 1]

        // if (customerSource) {
        //     const cards = await stripe.customers.listSources(
        //         customerId,
        //         {object: 'card', limit: 1}
        //     );
        //     data.card = card
        // }
        
        

        res.json({
            status:true,
            message:"Customer Exists!",
            data: data
        });
    }

    

}

exports.encodeEmail = async function(req, res, next) {
    let encodedEmail = res.app.locals.helpers.getEncodedEmail(req.params.email)

    res.json({
        string: encodedEmail
    });
}

exports.decodeEmail = async function(req, res, next) {
    let encodedEmail = res.app.locals.helpers.getEncodedDecoded(req.params.email)

    res.json({
        string: encodedEmail
    });
}