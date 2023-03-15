const fs = require('fs')
const path = require('path')

const Product = require('../models/product')
const Order = require('../models/order')

exports.getIndex = (req, res, next) => {

    Product.find()
      .then(products => {
        res.render('shop/index', {
            products: products, 
            pageTitle: 'Home',
            activeLink: '/',
            isAuthenticated: req.session.isLoggedIn
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list', {
            products: products, 
            pageTitle: 'Shop',
            activeLink: '/products',
            isAuthenticated: req.session.isLoggedIn
        })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
      .then(product => {
        if(product._id) {
            res.render('shop/product-detail', {
                product,
                pageTitle: 'Product Detail',
                activeLink: '/products',
                isAuthenticated: req.session.isLoggedIn
            })
        } else {
            res.status(404).render('404', {
                pageTitle: 'Page not found', 
                activeLink: null
            })
        }
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.getCart = (req, res, next) => {
    req.user
      .populate('cart.items.productId')
      .then(user => {
        const cartProducts = user.cart.items
        res.render('shop/cart', {
            cart: cartProducts,
            pageTitle: 'Your Cart',
            activeLink: '/cart',
            isAuthenticated: req.session.isLoggedIn
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.postCart = (req, res, next) => {
    const id = req.body.productId
    req.user.addToCart(id)
      .then(result => {
        res.redirect('/cart')
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.postDeleteCart = (req, res, next) => {
    const id = req.body.productId
    req.user.removeFromCart(id)
      .then(result => {
        res.redirect('/cart')
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        activeLink: '/checkout',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postOrders = (req, res) => {
    req.user
      .populate('cart.items.productId')
      .then(user => {
        const products = user.cart.items.map(item => {
            return {
                product: { ...item.productId },
                quantity: item.quantity
            }
        })

        const order = new Order({
            products: products,
            user: {
                email: req.user.email,
                userId: req.user
            }
        })
        return order.save()
      })
      .then(result => {
        return req.user.clearCart()
      })
      .then(result => {
        res.redirect('/orders')
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
      .then(orders => {
        res.render('shop/orders', {
            orders,
            pageTitle: 'My Orders',
            activeLink: '/orders',
            isAuthenticated: req.session.isLoggedIn
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.getInvoice = (req, res) => {
  const orderId = req.params.orderId
  const invoiceName = 'invoice-' + orderId + '.pdf'
  const invoicePath = path.join('data', 'invoices', invoiceName)
  // fs.readFile(invoicePath, (err, data) => {
  //   if(err) {
  //     return next(err)
  //   }
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'attachment;filename="' + invoiceName + '"');
  //   res.send(data);
  // })
  const file = fs.createReadStream(invoicePath)
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline;filename="' + invoiceName + '"');
  file.pipe(res)
}