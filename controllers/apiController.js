const stripe = require("stripe")(process.env.SKEY,{apiVersion: '2020-08-27'});

var Model = require('./../models/_model')

exports.checkEmail = async function(req, res, next) {

    // console.log(req.params.email);

    const customers = await stripe.customers.search({
        query: 'email:"'+req.params.email+'"',
    });

    let data = customers.data[customers.data.length - 1]

    if (customers && customers.data.length <= 0) {
        res.json({
            status:false,
            message:"Sorry! This promo is only for existing customers!"
        });
    } else {

        let customerId = data.id

        const cards = await stripe.customers.listSources(
            customerId,
            {object: 'card', limit: 1}
        );

        if (data.default_source) {
            data.sourceCard = data.default_source
        }

        if (cards && cards.data.length > 0) {
            // console.log(cards.data.length);
            data.card = cards.data[(cards.data.length-1)]
            data.sourceCard = data.card.id
        } else {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });

            console.log(paymentMethods);

            if ( paymentMethods.data && paymentMethods.data.length > 0 ) {
                data.sourceCard = paymentMethods.data[( paymentMethods.data.length-1 )].id
                data.card = paymentMethods.data[( paymentMethods.data.length-1 )].card
            }
        }

        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: 100,
        //     currency: 'usd',
        //     payment_method_types: ['card'],
        //     customer: customerId,
        //     description: "online 10 classes"
        // });

        // const paymentIntentConfirm = await stripe.paymentIntents.confirm(
        //     paymentIntent.id,
        //     {payment_method: data.default_source}
        // );

        // console.log(data);
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