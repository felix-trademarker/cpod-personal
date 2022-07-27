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

  orders.createdAtFormated = moment(orders.createdAt).format("MMMM Do YYYY")
  ejs.renderFile(__dirname+"/../emailTemplates/order.ejs", { orders: orders }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: orders.customerEmail,
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          // to: "carissa@trademarkers.com",
          bcc: ["carissa@trademarkers.com", "felix@bigfoot.com"],
          subject: "Chinesepod Personal | A new order has been placed | "+ orders.orderNo, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          if (err) {
            console.log(err.message);
            // res.flash('error', 'Sorry, something went wrong, try again later!');
          } else {
            console.log('Order Notification Sent!');
            // res.flash('success', 'Thank You! Your message has been successfully sent. We’ll get back to you very soon.');
          }

        });
      // })
       
    }
    
  });
  
}
