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
    var rpoOrders = new Model("orders")
    var rpoUsers = new Model("users")

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
    
        let description = "10 Classes Promo Order# " + orderNo
        
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

            // find users 
            let users = await rpoUsers.findQuery({email: req.body.email})

            let orderData = {
                orderNo: orderNo,
                description: description,
                amount: 299,
                customer: (users && users.length > 0 ? users[0] : null),
                customerEmail: req.body.email,
                customerFirstName: req.body.firstName,
                customerLastName: req.body.lastName,
                customerAddress: req.body.address,
                charge: charge
            }

            rpoOrders.put(orderData)
        }

        res.flash('success', 'Thank You!');

        res.redirect("/personal/thankyou/"+orderNo)

    } catch (err) {
        console.log(err);
        res.flash('error', 'Sorry!, Something went wrong please try again later.');
        // send admin notification 

    }
    
  
}

exports.thankyou = async function(req, res, next) {

    var rpoOrders = new Model("orders")
    let orders = await rpoOrders.findQuery({orderNo: req.params.orderNo})
    res.render('thank-you', {
        layout: 'layout/public-layout', 
        title: '',
        description: '',
        keywords: '',
        orders: (orders && orders.length > 0 ? orders[0] : null)
    });
    
  
}