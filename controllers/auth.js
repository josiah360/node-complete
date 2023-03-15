const crypto = require('crypto')

const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const sendMail = require('../lib/nodemailer')


exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash('error')[0]

  res.render('auth/login', {
    pageTitle: 'Login',
    activeLink: '/login',
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
    errorMessage: errorMessage,
    oldInput: {
      email: '',
      password: '',
    }
  })
}

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body
  let fetchedUser;

  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/signup',
      pageTitle: 'Signup',
      activeLink: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      }
    })
  }

  User.findOne({ 'email': email })
    .then(user => {
      if (!user) {
        req.flash('error', 'User does not exist. Click the signup button to sign up')
        return res.redirect('/login')
      }
      fetchedUser = user
      return bcrypt
        .compare(password, user.password)
        .then(isPasswordMatch => {
          if (!isPasswordMatch) {
            req.flash('error', 'Password does not match')
            return res.redirect('/login')
          }

          req.session.isLoggedIn = true
          req.session.user = fetchedUser
          req.session.save(err => {
            if (err) {
              console.log(err)
            }
            res.redirect('/')
          })
        })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
    res.redirect('/')
  })
}

exports.getSignUp = (req, res) => {
  const message = req.flash('error')[0]

  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    activeLink: '/signup',
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmedPassword: ''
    }
  })
}

exports.postSignUp = (req, res) => {
  const { email, password } = req.body
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      activeLink: '/signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmedPassword: req.body.confirmedPassword
      }
    })
  }

 
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {
          items: []
        }
      })
      return user.save()
    })
    .then(result => {
      let response = {
        body: {
          title: 'Welcome to Josiah Commerce!',
          greeting: 'Hello',
          name: '',
          intro: 'You have successfully signed up to Josiah Commerce!',
          action: {
            instructions: 'To get started with Josiah Commerce, please click here:',
            button: {
                color: '#22BC66', 
                text: 'Login to your account',
                link: 'http://localhost:3000/login'
            }
          },
          outro: 'We hope you enjoy all we have to offer you.',
          signature: 'Cheers',
        }
      }

      function message(mail) {
        return   {
          from: 'josh@josiah-commerce.com',
          to: email.trim(),
          subject: 'Sign Up Succeeded!',
          text: 'Hello world!',
          html: mail
        }
      }

      return sendMail(response, message)
    })
    .then(result => {
      res.redirect('/login')

    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getReset = (req, res) => {
  const message = req.flash('error')[0]

  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    activeLink: '/login',
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
    errorMessage: message,
    oldInput: ''
  })
}

exports.postReset = (req, res) => {
  const { email } = req.body
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/reset', {
      pageTitle: 'Reset Password',
      activeLink: '/login',
      isAuthenticated: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
      errorMessage: errors.array()[0].msg,
      oldInput: email
    })
  }

  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log(err)
      res.redirect('/reset')
    }

    const token = buffer.toString('hex')

    User.findOne({email: email})
    .then(user => {
      if(!user) {
        req.flash('error', 'User does not exist')
        res.redirect('/reset')
      }

      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save()
    })
    .then(result => {
      let response = {
        body: {
          intro: 'You requested a password reset.',
          action: {
            instructions: 'Click the link below to set a new password:',
            button: {
                color: '#22BC66', 
                text: 'Reset Password',
                link: `http://localhost:3000/reset/${token}`
            }
          },
          signature: 'Cheers',
        }
      }

      function message(mail) {
        return   {
          from: 'josh@josiah-commerce.com',
          to: email.trim(),
          subject: 'Password Reset',
          text: 'Hello world!',
          html: mail
        }
      }
      
      return sendMail(response, message)
    })
    .then(result => {
      res.redirect('/')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
  })
}

exports.getNewPassword = (req, res) => {
  const token = req.params.token

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }})
    .then(user => {

      let message;

      if(!user) {
        message = 'Token has expired'
      }

      message = req.flash('error')[0]

      res.render('auth/new-password', {
        pageTitle: 'Reset Password',
        activeLink: '/login',
        errorMessage: message,
        userId: user._id.toString(),
        token: token
      })
  })
  .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
}

exports.postNewPassword = (req, res) => {
  const { password: newPassword, userId, token: passwordToken } = req.body
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
  .then(user => {
      if(!user) {
        req.flash('error', 'Token has expired!')
        return req.redirect(`/reset/${passwordToken}`)
      }

    resetUser = user
    bcrypt.hash(newPassword, 12)
    .then(hashedPassword => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined
      resetUser.resetTokenExpiration = undefined
      return resetUser.save()
    }).then(result => {
      res.redirect('/login')
    })
    .catch(err => {
      res.redirect('/login')
    })
  })
  .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
}