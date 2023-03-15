const { body, } = require('express-validator')
const express = require('express')

const router = express.Router()

const adminControllers = require('../controllers/admin')

const isAuth = require('../middleware/isAuth')

router.get('/add-product', isAuth, adminControllers.getAddProducts)

router.get('/products', isAuth, adminControllers.getProducts)

router.post(
    '/product', 
    [
        body('title')
        .isString()
        .isLength({min: 3}) 
        .trim(),
        body('description')
        .isLength({min: 5})
        .trim(),
        body('price').isFloat()
    ],
    isAuth, 
    adminControllers.postAddProducts
)

router.get('/edit-product/:productId', isAuth, adminControllers.getEditProduct)

router.post(
    '/edit-product', 
    [
        body('title')
        .isString()
        .isLength({min: 3}) 
        .trim(),
        body('description')
        .isLength({min: 5})
        .trim(),
        body('price').isFloat()
    ],
    isAuth, 
    adminControllers.postEditProduct
)

router.post('/delete-product', isAuth, adminControllers.postDeleteProduct)

module.exports = router
