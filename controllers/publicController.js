const stripe = require("stripe")(process.env.SKEY,{apiVersion: '2020-08-27'});
let geoip = require('geoip-lite');
let emailService = require('./../services/emailNotificationService')

var Model = require('./../models/_model')


exports.index = async function(req, res, next) {

    let ip = req.ip;
    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    
    // USED ONLY FOR DEV
    if (req.ip == "::1") {
        ip = '69.162.81.155'
    }

    let decodedEmail = req.params.email

    let isValidEmail = res.app.locals.helpers.checkValidEmail(req.params.email)

    if (isValidEmail) {
        console.log("valid email");
        decodedEmail = req.params.email
    } else {
        decodedEmail = res.app.locals.helpers.getEncodedDecoded(req.params.email)
    }

    if (req.params.email) {
        res.cookie('custEmail',decodedEmail, { maxAge: 900000, httpOnly: true });
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

    console.log(geo);

    res.render('index-2', {
        layout: 'layout/public-layout-2', 
        title: '',
        description: '',
        keywords: '',
        clientTimezone: clientTimezone,
        timeTable: timeTable,
        timeZone: timeZone,
        custEmail: decodedEmail
    });
    
  
}

exports.checkout = async function(req, res, next) {

    // console.log("cookie",req.cookies.custEmail)

    let testEmail = "test@test.cc"
    const customers = await stripe.customers.search({
        query: 'email:"'+testEmail+'"',
    });
    

    console.log("customers", customers);

    let customerId = customers.data[customers.data.length - 1].id
    let customerSource = customers.data[customers.data.length - 1].default_source
    const card = await stripe.customers.retrieveSource(
        customerId,
        customerSource
    );


    console.log("Card Info", card);
    return;
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

    res.render('checkout', {
        layout: 'layout/public-layout-2', 
        title: '',
        description: '',
        keywords: '',
        clientTimezone: clientTimezone,
        timeTable: timeTable,
        timeZone: timeZone,
        custEmail: req.cookies.custEmail
    });
    
  
}

exports.placeorder = async function(req, res, next) {

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

    try {

        const customers = await stripe.customers.search({
            query: 'email:"'+req.body.email+'"',
        });
    
        if (customers && customers.data.length <= 0) {
            res.flash('error', 'Sorry, We could not find any active ChinesePod subscription.');
            res.redirect("/personal/")
        }

        let customerSource = ''
        if ( req.body.otherCard && req.body.stripeToken){
            customerSource = req.body.stripeToken
        } else {
            customerSource = customers.data[0].default_source
        }
    
        let description = "Online 10 Classes Promo Order# " + orderNo
        
        const charge = await stripe.charges.create({
            amount: (299 * 100),
            currency: 'USD',
            description: description,
            source: customerSource,
            receipt_email: req.body.email,
            customer: customers.data[0].id
        });

        if ( charge && charge.paid ) {
            //  send email notification
            // save record to mongo158

            // find users 
            let users = await rpoUsers.findQuery({email: req.body.email})

            let schedules = {
                date : req.body.date,
                time : req.body.time
            }

            let orderData = {
                orderNo: orderNo,
                description: 'Online 10 Classes',
                amount: 299,
                customer: (users && users.length > 0 ? users[0] : null),
                customerEmail: req.body.email,
                timeZone: req.body.selectedZone,
                schedules: schedules,
                charge: charge,
                createdAt: res.app.locals.moment().format()
            }

            rpoOrders.put(orderData)

            emailService.sendEmailNotification(orderData)
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
    console.log(orders);
    res.render('thank-you', {
        layout: 'layout/public-layout-2', 
        title: '',
        description: '',
        keywords: '',
        orders: (orders && orders.length > 0 ? orders[0] : null)
    });
    
  
}