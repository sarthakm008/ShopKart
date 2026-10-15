import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

const addToCart = async (req, res) => {
    const { productId } = req.params

    try {
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID'
            })
        }

        
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }

        
        const customer = req.user

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        )

        if (cartItem) {

            if (cartItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    message: 'Requested quantity exceeds available stock'
                })
            }

            cartItem.quantity += 1
        } else {

            if (product.stock < 1) {
                return res.status(400).json({
                    message: 'Product is out of stock'
                })
            }

            customer.cart.push({
                product: productId,
                quantity: 1
            })
        }

        await customer.save()

        const updatedCustomer = await Customer
            .findById(customer._id)
            .populate({
                path: 'cart.product',
                select: 'name price category image stock'
            })

        return res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart: updatedCustomer.cart
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

const getCart = async (req, res) => {
    try {
        const customer = await Customer
            .findById(req.user._id)
            .populate({
                path: 'cart.product',
                select: 'name price category image stock'
            })

        return res.status(200).json({
            success: true,
            cart: customer.cart
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

const updateCartQuantity = async (req, res) => {
    const { productId } = req.params
    const { quantity } = req.body

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID'
            })
        }

        if (
            typeof quantity !== 'number' ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                message: 'Quantity must be at least 1'
            })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: 'Requested quantity exceeds available stock'
            })
        }

        const customer = req.user

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        )

        if (!cartItem) {
            return res.status(404).json({
                message: 'Product not in cart'
            })
        }

        cartItem.quantity = quantity

        await customer.save()

        const updatedCustomer = await Customer
            .findById(customer._id)
            .populate({
                path: 'cart.product',
                select: 'name price category image stock'
            })

        return res.status(200).json({
            success: true,
            message: 'Cart quantity updated',
            cart: updatedCustomer.cart
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

const removeFromCart = async (req, res) => {
    const { productId } = req.params

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID'
            })
        }

        const customer = req.user

        const productIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        )

        if (productIndex === -1) {
            return res.status(404).json({
                message: 'Product not in cart'
            })
        }

        customer.cart.splice(productIndex, 1)

        await customer.save()

        const updatedCustomer = await Customer
            .findById(customer._id)
            .populate({
                path: 'cart.product',
                select: 'name price category image stock'
            })

        return res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart: updatedCustomer.cart
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

export {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
}