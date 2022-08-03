const nodemailer = require("nodemailer");
const ejs = require("ejs");
var moment = require("moment")

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME, 
    pass: process.env.MAIL_PASSWORD
  }
});

let toAdmin = "";
let toCustomer = "";
let toBcc = [];

if (process.env.ENVIRONMENT == "dev") {
  toAdmin = "felix@bigfoot.com";
  toCustomer = "felix@bigfoot.com";
  toBcc = ["felix@bigfoot.com"];
}



exports.sendEmailNotification = async function(orders) {

  orders.createdAtFormated = moment(orders.createdAt).format("MMMM DD, YYYY")
  ejs.renderFile(__dirname+"/../emailTemplates/order.ejs", { orders: orders }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: orders.customerEmail,
          // to: "felix@bigfoot.com",
          bcc: ["courses@chinesepod.com", "felix@bigfoot.com"],
          // bcc: ["felix@bigfoot.com","carissa@chinesepod.com"],
          subject: "Chinesepod LLC | "+ orders.orderNo, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          if (err) {
            console.log(err.message);
          } else {
            console.log('Order Notification Sent!');
          }

        });
       
    }
    
  });

  ejs.renderFile(__dirname+"/../emailTemplates/orderAdmin.ejs", { orders: orders }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "felix@bigfoot.com",
          to: "courses@chinesepod.com",
          // bcc: ["courses@chinesepod.com", "felix@bigfoot.com"],
          // bcc: ["felix@bigfoot.com","carissa@chinesepod.com"],
          bcc: ["felix@bigfoot.com"],
          subject: "Chinesepod Personal | A new order has been placed | "+ orders.orderNo, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          if (err) {
            console.log(err.message);
          } else {
            console.log('Admin Order Notification Sent!');
          }

        });
       
    }
    
  });
  
}
