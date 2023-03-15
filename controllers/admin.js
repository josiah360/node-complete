const { validationResult } = require('express-validator')

const Product = require('../models/product')

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        activeLink: '/admin/add-product',
        editing: false,
        hasError: false,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: null
    })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit === 'true'
    const prodId = req.params.productId

    if(!editMode) {
        res.redirect('/')
    }

    Product.findById(prodId)
      .then(product => {
        if(!product) {
            res.redirect('/')
        }

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            activeLink: '/admin/edit-product',
            product,
            editing: editMode,
            hasError: false,
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: null
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.postEditProduct = (req, res, next) => {
    const {productId, title, description, price } = req.body
    const image = req.file

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        activeLink: '/admin/edit-product',
        editing: true,
        hasError: true,
        isAuthenticated: req.session.isLoggedIn,
        product: { id: productId, title, description, price },
        errorMessage: errors.array[0].msg
      })
    }


    Product.findById(productId)
      .then(product => { 
        if(product.userId.toString() !== req.user._id.toString()) {
          return res.redirect('/')
        }

        if(image) {
          product.imgUrl = image.path
        }

        product.title = title
        product.price = price
        product.description = description
        return product.save()
      })
      .then(result => {
        res.redirect('/admin/products')
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.postAddProducts = (req, res, next) => {
    const user = req.user
    const {title, description, price} = req.body
    const image = req.file

    if(!image) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        activeLink: '/admin/add-product',
        editing: false,
        hasError: true,
        isAuthenticated: req.session.isLoggedIn,
        product: { title, description, price },
        errorMessage: 'Attached file is not an image'
      })
    }

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        activeLink: '/admin/add-product',
        editing: false,
        hasError: true,
        isAuthenticated: req.session.isLoggedIn,
        product: { title, imgUrl, description, price },
        errorMessage: errors.array[0].msg
      })
    }

    const product = new Product({
      title, price, description, imgUrl: image.path, userId: user
    })
    product.save()
      .then(result => {
        res.redirect('/admin/products')
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)

      })
}

exports.getProducts = (req, res, next) => {
    Product.find({'userId': req.user._id})
      .then(products => {
        res.render('admin/products', {
            products: products, 
            pageTitle: 'Admin Products',
            activeLink: '/admin/products',
            isAuthenticated: req.session.isLoggedIn
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body
    Product.deleteOne({_id: productId, userId: req.user._id})
      .then(result => {
        res.redirect('/admin/products')
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
}