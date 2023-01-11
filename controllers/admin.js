const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        activeLink: '/admin/add-product',
        editing: false
    })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit === 'true'
    const prodId = req.params.productId

    if(!editMode) {
        res.redirect('/')
    }

    Product.getProductById(prodId, product => {
        if(!product) {
            res.redirect('/')
        }

        console.log(typeof product.price)

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            activeLink: '/admin/edit-product',
            product,
            editing: editMode,
        })
    })
}

exports.postEditProduct = (req, res, next) => {
    const {productId, title, imgUrl,description, price } = req.body
    const updatedProduct = new Product(productId, title, imgUrl, description, price)
    updatedProduct.save()
    res.redirect('/admin/products')
}

exports.postAddProducts = (req, res, next) => {
    const {title, imgUrl, description, price} = req.body
    const product = new Product(null, title, imgUrl, description, price)
    product.save()
    res.redirect('/')
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            products: products, 
            pageTitle: 'Admin Products',
            activeLink: '/admin/products'
        })
    })
}

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body
    Product.deleteProductById(productId, productPrice => {
        Cart.deleteCartProductById(productId, productPrice)
    })
    res.redirect('/admin/products')
}