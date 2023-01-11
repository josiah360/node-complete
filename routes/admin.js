
const express = require('express')

const router = express.Router()

const adminControllers = require('../controllers/admin')

router.get('/add-product', adminControllers.getAddProducts)

router.get('/products', adminControllers.getProducts)

router.post('/product', adminControllers.postAddProducts)

router.get('/edit-product/:productId', adminControllers.getEditProduct)

router.post('/edit-product', adminControllers.postEditProduct)

router.post('/delete-product', adminControllers.postDeleteProduct)

module.exports = router
