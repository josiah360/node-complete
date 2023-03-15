const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')

async function sendMail(res, messageConfig) {
    let config = {
        service: 'gmail',
        auth: {
          user: 'josiaholajide@gmail.com',
          pass: 'quengenebvitswrc'
        }
      }
    
      let transporter = nodemailer.createTransport(config)
    
      let mailGenerator = new Mailgen({
        theme: 'default',
        product: {
          name: 'Josiah Commerce',
          link: 'http://localhost:3000',
          copyright: 'Copyright © 2023 Josiah Commerce. All rights reserved.',
        }
      })
    
      let response = res
    
      let mail = mailGenerator.generate(response)
    
      let message = messageConfig(mail)
    
      return transporter.sendMail(message)
        .then(() => {
          console.log('You have a message')
        })
}

module.exports = sendMail
