const path = require('path')
const fs = require('fs')

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data', 
    'cart.json'
)

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart;
            if(err) {
                cart = {products: [], totalPrice: 0}
            } else {
                cart = JSON.parse(fileContent)
            }
            const existingProductIndex = cart.products.findIndex(product => product.id === id)
            const existingProduct = cart.products[existingProductIndex]

            let updatedProduct;
            if(existingProduct) {
                updatedProduct = { ...existingProduct }
                updatedProduct.qty += 1
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct

            } else {
                updatedProduct = {id: id,  qty: 1 }
                cart.products = [...cart.products, updatedProduct]
            }
            cart.totalPrice += +productPrice
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err)
            })
        })
    }

    static deleteProductFromCart(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart;
            if(err) {
                cart = {products: [], totalPrice: 0}
            } else {
                cart = JSON.parse(fileContent)
            }
            
            const productIndex = cart.products.findIndex(product => product.id === id)
            const existingProduct = cart.products[productIndex]

            let updatedProduct;

            if(existingProduct.qty > 1) {
                updatedProduct = { ...existingProduct }
                updatedProduct.qty -= 1
                cart.products[productIndex] = updatedProduct
                cart.totalPrice -= productPrice
                fs.writeFile(p, JSON.stringify(cart), (err) => {
                    console.log(err)
                })
            } else {
                let products = cart.products.filter(product => product.id !== existingProduct.id)
                const updatedProducts = [...products]
                const updatedTotalPrice = cart.totalPrice - productPrice
                cart = {products: updatedProducts, totalPrice: updatedTotalPrice}
                fs.writeFile(p, JSON.stringify(cart), (err) => {
                    console.log(err)
                })
            }
        })
    }

    static deleteCartProductById(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart;
            if(err) {
                cart = {products: [], totalPrice: 0}
            } else {
                cart = JSON.parse(fileContent)
            }

            const existingProductIndex = cart.products.findIndex(product => product.id === id)
            const existingProduct = cart.products[existingProductIndex]

            if(existingProduct) {
                let products = cart.products.filter(product => product.id !== id)
                const updatedProducts = [...products]
                const updatedTotalPrice = cart.totalPrice - (productPrice * existingProduct.qty)
                cart = {products: updatedProducts, totalPrice: updatedTotalPrice}
                fs.writeFile(p, JSON.stringify(cart), (err) => {
                    console.log(err)
                })
            }          
        })
    }

    static fetchAllCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            if(err) {
                cb({products: [], totalPrice: 0})
            } else {
                cb(JSON.parse(fileContent))
            }
        })
    }
}