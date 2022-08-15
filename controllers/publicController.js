const stripe = require("stripe")(process.env.SKEY,{apiVersion: '2020-08-27'});
let geoip = require('geoip-lite');
let emailService = require('./../services/emailNotificationService')
let logService = require('./../services/activityLogService')
let userService = require('./../services/userService')

var Model = require('./../models/_model')



exports.index = async function(req, res, next) {

    // console.log('returned data',await userService.getUser('felix@bigfoot.com'));

    let ip = req.ip;
    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    
    // USED ONLY FOR DEV
    if (req.ip == "::1") {
        ip = '1.174.208.155'
    }

    let decodedEmail = req.params.email

    let isValidEmail = res.app.locals.helpers.checkValidEmail(req.params.email)

    if (isValidEmail) {
        console.log("valid email");
        decodedEmail = req.params.email
    } else {
        decodedEmail = res.app.locals.helpers.getEncodedDecoded(req.params.email)
    }

    await userService.getUser(decodedEmail)

    logService.logActivity(req, decodedEmail + " Visited personal page")

    if (req.params.email) {
        res.cookie('custEmail',decodedEmail, { maxAge: 900000, httpOnly: true });
    }

    let geo = geoip.lookup(ip);


    let timeZone = [
        ['New York', 'EST', 'Pacific', 'Mountain', 'Central' ],
        ['Berlin', 'Paris', 'Rome' ],
        ['United Kingdom', 'IIM']
    ]

    let clientTimezone = 0;

    console.log(geo);

    if (geo.country == 'US') {
        clientTimezone = 0
    }

    if (geo.country == 'DE') {
        clientTimezone = 1
    }

    if (geo.country == 'GB') {
        clientTimezone = 2
    }

    // console.log(res.app.locals.helpers.getEncodedEmail(decodedEmail));

    res.render('index-2', {
        layout: 'layout/public-layout-2', 
        title: '',
        description: '',
        keywords: '',
        // clientTimezone: geo.timezone,
        clientTimezone: timeZone[clientTimezone].join(', '),
        // timeTable: timeTable,
        // timeZone: timeZone,
        custEmail: decodedEmail,
        encodedEmail: res.app.locals.helpers.getEncodedEmail(decodedEmail)
    });
    
  
}

exports.orderForm = async function(req, res, next) {

    let ip = req.ip;
    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    
    // USED ONLY FOR DEV
    if (req.ip == "::1") {
        ip = '1.174.208.155'
    }

    let decodedEmail = req.params.email

    let isValidEmail = res.app.locals.helpers.checkValidEmail(req.params.email)

    if (isValidEmail) {
        console.log("valid email");
        decodedEmail = req.params.email
    } else {
        decodedEmail = res.app.locals.helpers.getEncodedDecoded(req.params.email)
    }

    await userService.getUser(decodedEmail)

    logService.logActivity(req, decodedEmail + " Visited personal page")

    if (req.params.email) {
        res.cookie('custEmail',decodedEmail, { maxAge: 900000, httpOnly: true });
    }

    let geo = geoip.lookup(ip);


    let timeZone = [
        ['New York', 'EST', 'Pacific', 'Mountain', 'Central' ],
        ['Berlin', 'Paris', 'Rome' ],
        ['United Kingdom', 'IIM']
    ]

    let clientTimezone = 0;

    console.log(geo);

    if (geo.country == 'US') {
        clientTimezone = 0
    }

    if (geo.country == 'DE') {
        clientTimezone = 1
    }

    if (geo.country == 'GB') {
        clientTimezone = 2
    }

    // console.log(res.app.locals.helpers.getEncodedEmail(decodedEmail));

    res.render('orderForm', {
        layout: 'layout/public-layout-2', 
        title: '',
        description: '',
        keywords: '',
        // clientTimezone: geo.timezone,
        clientTimezone: timeZone[clientTimezone].join(', '),
        // timeTable: timeTable,
        // timeZone: timeZone,
        custEmail: decodedEmail,
        encodedEmail: res.app.locals.helpers.getEncodedEmail(decodedEmail)
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
    
    // console.log(req.body);
    // return 

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

    logService.logActivity(req, req.body.email + " Placed order with order No."+ orderNo)

    try {

        const customers = await stripe.customers.search({
            query: 'email:"'+req.body.email+'"',
        });
    
        if (customers && customers.data.length <= 0) {
            res.flash('error', 'Sorry, We could not find any active ChinesePod subscription.');
            res.redirect("/personal/")
        }

        let paymentIntentConfirm;
        let customerSource = ''
        let customerId = req.body.customerId
        
        // console.log(req.body);
        // return;
    
        let description = "Online 10 Classes Promo Order# " + orderNo
        
        // let paymentIntentConfirm = await stripe.charges.create({
        //     amount: (299 * 100),
        //     currency: 'USD',
        //     description: description,
        //     source: customerSource,
        //     receipt_email: req.body.email,
        //     customer: customers.data[0].id
        // });

        

        // payment transaction
        if ( req.body.otherCard && req.body.stripeToken){
            // USING OTHER CARD
            customerSource = req.body.stripeToken
            paymentIntentConfirm = await stripe.charges.create({
                amount: (299 * 100),
                currency: 'USD',
                description: description,
                source: customerSource,
                receipt_email: req.body.email,
                customer: customerId
            });
        } else {
            // USING CURRENT CARD
            customerSource = req.body.sourceCard
            const paymentIntent = await stripe.paymentIntents.create({
                amount: (299 * 100),
                currency: 'usd',
                payment_method_types: ['card'],
                customer: customerId,
                description: description
            });
            
            paymentIntentConfirm = await stripe.paymentIntents.confirm(
                paymentIntent.id,
                {payment_method: customerSource}
            );
        }

        // console.log(paymentIntentConfirm);

        if ( paymentIntentConfirm ) {

            console.log("==== payment ====");
            //  send email notification
            // save record to mongo158

            // find users 
            // let users = await rpoUsers.findQuery({email: req.body.email})
            let users = await userService.getUser(req.body.email)

            // let schedules = {
            //     date : req.body.date,
            //     time : req.body.time
            // }

            let orderData = {
                orderNo: orderNo,
                description: 'Online 10 Classes',
                amount: 299,
                customer: users,
                customerEmail: req.body.email,
                timeZone: req.body.selectedZone,
            }

            await rpoOrders.put(orderData)

            // emailService.sendEmailNotification(orderData)
        }

        res.flash('success', 'Thank You!');

        res.redirect("/personal/thankyou/"+orderNo)

    } catch (err) {
        console.log("has error",err);
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
        // layout: 'layout/testTemplate', 
        title: '',
        description: '',
        keywords: '',
        orders: (orders && orders.length > 0 ? orders[0] : null)
    });
    
  
}

exports.thankyouSubmit = async function(req, res, next) {

    var rpoOrders = new Model("orders")
    let orders = await rpoOrders.findQuery({orderNo: req.params.orderNo})
    
    console.log(req.body);

    let dataUpdate = {
        contactPreferrence: req.body.contactPreferrence,
        contactPreferrenceValue: req.body.contactPreferrenceValue,
        schedules: req.body.fields
    }

    await rpoOrders.update(orders[0]._id, dataUpdate)

    let orderData = await rpoOrders.findQuery({orderNo: req.params.orderNo}) 

    emailService.sendEmailNotification(orderData[0])

    res.flash('success', 'Thank you for updating the order details!');

    res.redirect("/personal/thankyou/"+orders[0].orderNo)
    
}

exports.login = async function(req, res, next) {

    let decodedEmail = req.params.email

    let isValidEmail = res.app.locals.helpers.checkValidEmail(req.params.email)

    if (isValidEmail) {
        console.log("valid email");
        decodedEmail = req.params.email
    } else {
        decodedEmail = res.app.locals.helpers.getEncodedDecoded(req.params.email)
    }

    res.render('login', {
        layout: 'layout/public-layout-login', 
        // layout: 'layout/testTemplate', 
        title: '',
        description: '',
        keywords: '',
        decodedEmail: decodedEmail
    });
    
  
}