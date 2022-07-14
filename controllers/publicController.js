const stripe = require("stripe")(process.env.SKEY);

var Model = require('./../models/_model')


exports.index = async function(req, res, next) {

    res.render('index', {
        layout: 'layout/public-layout', 
        title: '',
        description: '',
        keywords: ''
    });
    
  
}

exports.placeorder = async function(req, res, next) {

    console.log("placed!", req.body);
    var rpoOrders = new Model("orders.personal")

    // create order ID
    let flag=true
    let orderNo = ""
    do {
        orderNo = res.app.locals.helpers.makeid(2) + '-' + res.app.locals.helpers.makeid(4)

        let findOrder = rpoOrders.findQuery({orderNo: orderNo})

        if (findOrder && findOrder.length > 0) {
            flag = true
        } else {
            flag = false
        }

    }while(flag);

    console.log(orderNo);

    // return;

    try {

        const stripeCustomer = await stripe.customers.create({
            email: req.body.email,
        });
    
    
        const source = await stripe.customers.createSource(
            stripeCustomer.id,
            {
                source: req.body.stripeToken,
            }
        );
    
        let description = "10 Promo Classes Order# " + orderNo
        
        const charge = await stripe.charges.create({
            amount: (299 * 100),
            currency: 'USD',
            description: description,
            source: source.id,
            metadata : {
              'firstName': req.body.firstName,
              'lastName' : req.body.lastName,
              'address'  : req.body.address,
              'email'    : req.body.email
            },
            receipt_email: req.body.email,
            customer: stripeCustomer.id
        });

        if ( charge && charge.paid ) {
            //  send email notification
            // save record to mongo158

            
        }

        res.flash('success', 'Thank You!');

        res.redirect("/personal")

    } catch (err) {
        console.log(err);
        res.flash('error', 'Sorry!, Something went wrong please try again later.');
        // send admin notification 

    }
    
  
}
