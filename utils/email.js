const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },

    // Mailtrap.io is nice

    // Activate in gmail "less secure app" option

    // 🚨🚨🚨

    // Gmail is not a good idea, you can only send 500 emails per day +
    // you will be marked as a spammer
  })
  //   console.log('auth: ', transporter.options.auth)

  //2) Define email options
  const mailOptions = {
    from: 'Al-Menbar Academy <ya7yakassab@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Add this line
  }

  //3) Send email with nodemailer
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
