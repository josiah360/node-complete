const express = require('express')

const router = express.Router()

const shopControllers = require('../controllers/shop')

router.get('/', shopControllers.getIndex)

router.get('/products', shopControllers.getProducts)

router.get('/cart', shopControllers.getCart)

router.post('/cart', shopControllers.postCart)

router.get('/checkout', shopControllers.getCheckout)

router.get('/orders', shopControllers.getOrders)

router.get('/products/:productId', shopControllers.getProduct)

router.post('/delete-cart', shopControllers.postDeleteCart)

module.exports = router