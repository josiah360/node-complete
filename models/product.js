const fs = require('fs')
const path = require('path')
const { threadId } = require('worker_threads')

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data', 
    'products.json'
)

function getProductsfromFile(cb) {
    fs.readFile(p, (err, fileContent) => {
        if(err) {
            cb([])
        } else {
            cb(JSON.parse(fileContent, p))
        }
    })
}

module.exports = class Products {
    constructor(id, title, imgUrl, description, price) {
        this.id = id
        this.title = title
        this.imgUrl = imgUrl
        this.description = description
        this.price = parseFloat(price)
    }

    save() {
         getProductsfromFile(products => {
            if(this.id) {
                const existingProductIndex = products.findIndex(product => product.id === this.id)
                const updatedProducts = [...products]
                updatedProducts[existingProductIndex] = this
                fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                    console.log(err)
                })
            } else {
                this.id = Math.random().toString()
                getProductsfromFile(products => {
                    products.push(this)
                    fs.writeFile(p, JSON.stringify(products), (err) => {
                        console.log(err)
                    })
                })
            }
         })
    }

    static getProductById(id, cb) {
        getProductsfromFile(products => {
            const existingProduct = products.find(product => product.id === id)
            if(existingProduct) {
                cb(existingProduct)
            } else {
                cb({})
            }
        })
    }

    static deleteProductById(id, cb) {
        getProductsfromFile(products => {
            const existingProductIndex = products.findIndex(product => product.id === id)
            const updatedProducts = [...products]
            const product = updatedProducts[existingProductIndex]
            const filteredProducts = updatedProducts.filter(product => product.id !== id)
            fs.writeFile(p, JSON.stringify(filteredProducts), (err) => {
                console.log(err)
                if(!err) {
                    cb(product.price)
                }
            })

        })
    }

    static fetchAll(cb) {
        getProductsfromFile(cb)
    }
}
