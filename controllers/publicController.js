const stripe = require("stripe")(process.env.SKEY,{apiVersion: '2020-08-27'});
let geoip = require('geoip-lite');

var Model = require('./../models/_model')


exports.index = async function(req, res, next) {

    let ip = req.ip;
    
    // USED ONLY FOR DEV
    if (req.ip == "::1") {
        ip = '69.162.81.155'
    }

    let geo = geoip.lookup(ip);

    var rpoTimeTable = new Model("timeTable")

    let timeTable = await rpoTimeTable.get()

    let timeZone = [
        ['New York', 'EST', 'Pacific', 'Mountain', 'Central' ],
        ['Berlin', 'Paris', 'Rome' ],
        ['United Kingdom', 'IIM']
    ]

    let clientTimezone = 0;

    if (geo.country == 'US') {
        clientTimezone = 0
    }

    if (geo.country == 'DE') {
        clientTimezone = 1
    }

    if (geo.country == 'GB') {
        clientTimezone = 2
    }

    // console.log(geo);

    res.render('index', {
        layout: 'layout/public-layout', 
        title: '',
        description: '',
        keywords: '',
        clientTimezone: clientTimezone,
        timeTable: timeTable,
        timeZone: timeZone
    });
    
  
}

exports.placeorder = async function(req, res, next) {

    console.log("placed!", req.body);

    const customers = await stripe.customers.search({
        query: 'email:"'+req.body.email+'"',
    });

    if (customers && customers.data.length <= 0) {

        res.flash('error', 'Sorry! This promo is only for existing customers!');
        res.redirect("/personal/")
    }

    // console.log(req.body);
    // return;
    // return

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

        // const stripeCustomer = await stripe.customers.create({
        //     email: req.body.email,
        // });
    
    
        // const source = await stripe.customers.createSource(
        //     stripeCustomer.id,
        //     {
        //         source: req.body.stripeToken,
        //     }
        // );
    
        let description = "10 Classes Promo Order# " + orderNo
        
        const charge = await stripe.charges.create({
            amount: (299 * 100),
            currency: 'USD',
            description: description,
            source: customers.data[0].default_source,
            receipt_email: req.body.email,
            customer: customers.data[0].id
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
                customerZone: req.body.selectedZone,
                customerTime: req.body.timeSelected,
                charge: charge
            }

            rpoOrders.put(orderData)
        }

        res.flash('success', 'Thank You!');

        res.redirect("/personal/thankyou/"+orderNo)

    } catch (err) {
        console.log(err);
        res.flash('error', 'Sorry! Something went wrong please try again later.');
        res.redirect("/personal/")
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