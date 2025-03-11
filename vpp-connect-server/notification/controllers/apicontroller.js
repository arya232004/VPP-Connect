require("dotenv").config();
const nodemailer = require("nodemailer");


const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendemail(email, subject, message) {
    const mailOptions = {
        from: `VPP Connect <${process.env.EMAIL_ID}>`,
        to: email,
        subject: subject,
        html: message
    };

    console.log("Mail Options:", mailOptions);

    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return reject(error);
            }
            console.log("Message sent successfully:", info.response);
            resolve(info);
        });
    });
}

module.exports = { smtpTransport, sendemail };