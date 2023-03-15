const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
                quantity: {type: Number, required: true}
            }
        ]
    },
})

userSchema.methods.addToCart = function(id) {
    const cartItemIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === id.toString()
    })

    let newQuantity = 1
    const newItems = [ ...this.cart.items ]
    if(cartItemIndex >= 0) {
        newQuantity = newItems[cartItemIndex].quantity + newQuantity
        newItems[cartItemIndex].quantity = newQuantity
    } else {
        newItems.push({
            productId: id,
            quantity: newQuantity
        })
    }

    this.cart.items = newItems
    return this.save()
}

userSchema.methods.removeFromCart = function(id) {
    const filteredCartItems = this.cart.items.filter(item => item.productId.toString() !== id.toString())
    this.cart.items = filteredCartItems
    return this.save()
}

userSchema.methods.clearCart = function() {
    this.cart = {
        items: []
    }
    return this.save()
}

module.exports = mongoose.model('User', userSchema)