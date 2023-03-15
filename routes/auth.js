const express = require('express')
const { check, body } = require('express-validator')

const router = express.Router()

const authControllers = require('../controllers/auth')
const isAuth = require('../middleware/isAuth')
const User = require('../models/user')

router.get('/login', authControllers.getLogin)

router.post(
    '/login', 
    [
        check('email')
        .isEmail()
        .withMessage('Please Enter a valid email')
        .normalizeEmail(),
        body('password', 'Your password must be min of 5 letters in length')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
    ],
    authControllers.postLogin
)

router.post('/logout', isAuth, authControllers.postLogout)

router.get('/signup', authControllers.getSignUp)

router.post(
    '/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            // if(value === 'test@test.com') {
            //     throw new Error('This email address is forbidden')
            // }
            // return true
            return User.findOne({ 'email': value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists')
                    }
                })
        })
        .normalizeEmail(),
        body('password', 'Please enter a password and text and at least 5 charachters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
        body('confirmedPassword')
        .custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error('Password has to match')
            }
            return true
        })
        .trim()
        

    ], 
    authControllers.postSignUp
)

router.get('/reset', authControllers.getReset)

router.post(
    '/reset',   
    body('email')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
    authControllers.postReset
)

router.get('/reset/:token', authControllers.getNewPassword)

router.post('/new-password', authControllers.postNewPassword)

module.exports = router