import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

const addToWishlist = async (req, res) => {
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

        if (customer.wishlist.includes(productId)) {
            return res.status(409).json({
                message: 'Product already in wishlist'
            })
        }

        customer.wishlist.push(productId)

        await customer.save()

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

const getWishlist = async (req, res) => {
    try {
        const customer = await Customer
            .findById(req.user._id)
            .populate({
                path: 'wishlist',
                select: 'name price category image stock'
            })

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

const removeFromWishlist = async (req, res) => {
    const { productId } = req.params

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID'
            })
        }

        const customer = req.user

        const productIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        )

        if (productIndex === -1) {
            return res.status(404).json({
                message: 'Product not in wishlist'
            })
        }

        customer.wishlist.splice(productIndex, 1)

        await customer.save()

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}

export {
    addToWishlist,
    getWishlist,
    removeFromWishlist
}