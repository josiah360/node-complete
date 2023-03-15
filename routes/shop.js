const express = require('express')

const router = express.Router()

const shopControllers = require('../controllers/shop')

const isAuth = require('../middleware/isAuth')

router.get('/', shopControllers.getIndex)

router.get('/products', shopControllers.getProducts)

router.get('/cart', isAuth, shopControllers.getCart)

router.post('/cart', isAuth, shopControllers.postCart)

// router.get('/checkout', shopControllers.getCheckout)

router.get('/orders', isAuth, shopControllers.getOrders)

router.post('/orders', isAuth, shopControllers.postOrders)

router.get('/products/:productId', shopControllers.getProduct)

router.post('/delete-cart', isAuth, shopControllers.postDeleteCart)

router.get('/orders/:orderId', isAuth, shopControllers.getInvoice)

module.exports = router