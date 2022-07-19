const nodemailer = require("nodemailer");

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



exports.sendEmailNotification = async function(mailData) {

  return await transporter.sendMail({
    sender: process.env.MAIL_FROM,
    replyTo: process.env.MAIL_FROM,
    from: process.env.MAIL_FROM, 
    to: mailData.to,
    subject: mailData.subject, 
    html: mailData.message, 
  });
  
}
