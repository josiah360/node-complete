const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getIndex = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/index', {
            products: products, 
            pageTitle: 'Home',
            activeLink: '/'
        })
    })
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            products: products, 
            pageTitle: 'Shop',
            activeLink: '/products'
        })
    })
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId
    Product.getProductById(id, product => {
        if(product.id) {
            res.render('shop/product-detail', {
                product,
                pageTitle: 'Product Detail',
                activeLink: '/products'
            })
        } else {
            res.status(404).render('404', {
                pageTitle: 'Page not found', 
                activeLink: null
            })
        }
    })
}

exports.getCart = (req, res, next) => {
    Cart.fetchAllCart(cart => {
        Product.fetchAll(products => {
            let cartProducts = []
            for(let product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if(cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty})
                }
            }
            
            res.render('shop/cart', {
                cart: cartProducts,
                pageTitle: 'Your Cart',
                activeLink: '/cart'
            })
        })
    })
}

exports.postCart = (req, res, next) => {
    const id = req.body.productId
    Product.getProductById(id, product => {
        Cart.addProduct(id, product.price)
    })
    res.redirect('/cart')
}

exports.postDeleteCart = (req, res, next) => {
    const id = req.body.productId
    Product.getProductById(id, product => {
        Cart.deleteProductFromCart(id, product.price)
    })
    res.redirect('/cart')
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        activeLink: '/checkout'
    })
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'My Orders',
        activeLink: '/orders'
    })
}
