
import mongoose from 'mongoose'
import crypto from 'crypto'

import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'
import Order from '../models/order.model.js'
import razorpay from '../config/razorpay.js'

const createPaymentOrder = async (req, res) => {
    const { shippingAddress } = req.body

    let shopKartOrder

    try {
        const requiredFields = [
            'fullName',
            'phone',
            'addressLine1',
            'city',
            'state',
            'pincode'
        ]

        if (
            !shippingAddress ||
            requiredFields.some(
                (field) =>
                    typeof shippingAddress[field] !== 'string' ||
                    !shippingAddress[field].trim()
            )
        ) {
            return res.status(400).json({
                message: 'All shipping fields are required'
            })
        }

        if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
            return res.status(400).json({
                message: 'Phone must contain 10 digits'
            })
        }

        if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
            return res.status(400).json({
                message: 'Pincode must contain 6 digits'
            })
        }

        const customer = await Customer.findById(req.user._id)
            .populate({
                path: 'cart.product',
                select: 'name price image stock'
            })

        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found'
            })
        }

        if (!customer.cart.length) {
            return res.status(400).json({
                message: 'Your cart is empty'
            })
        }
        const orderItems = []
        let totalAmount = 0

        for (const cartItem of customer.cart) {
            if (!cartItem.product) {
                return res.status(400).json({
                    message: 'A product in your cart no longer exists'
                })
            }

            const product = await Product.findById(
                cartItem.product._id
            )

            if (!product) {
                return res.status(400).json({
                    message: 'A product in your cart no longer exists'
                })
            }

            if (
                !Number.isInteger(cartItem.quantity) ||
                cartItem.quantity < 1
            ) {
                return res.status(400).json({
                    message: `Invalid quantity for ${product.name}`
                })
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                })
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            })

            totalAmount += product.price * cartItem.quantity
        }

        totalAmount = Math.round(
            (totalAmount + Number.EPSILON) * 100
        ) / 100

        shopKartOrder = await Order.create({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone: shippingAddress.phone.trim(),
                addressLine1: shippingAddress.addressLine1.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: shippingAddress.pincode.trim()
            },
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT'
        })

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: shopKartOrder._id.toString()
        })

        shopKartOrder.razorpayOrderId = razorpayOrder.id
        await shopKartOrder.save()

        return res.status(201).json({
            success: true,
            message: 'Payment order created',
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (err) {
        console.error(err)

        if (shopKartOrder) {
            try {
                await Order.findByIdAndDelete(shopKartOrder._id)
            } catch (cleanupError) {
                console.error('Failed to clean up pending order:', cleanupError)
            }
        }

        return res.status(500).json({
            message: 'Unable to create payment order'
        })
    }
}


const verifyPayment = async (req, res) => {
    const {
        shopKartOrderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body

    try {
        if (
            !shopKartOrderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: 'Missing payment verification details'
            })
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                message: 'Invalid ShopKart order ID'
            })
        }

        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        if (order.paymentStatus === 'PAID') {
            return res.status(409).json({
                message: 'This order has already been paid'
            })
        }

        if (
            order.paymentStatus !== 'PENDING' ||
            order.status !== 'PENDING_PAYMENT'
        ) {
            return res.status(400).json({
                message: 'Order is not awaiting payment'
            })
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                message: 'Razorpay order ID mismatch'
            })
        }

        const body =
            `${order.razorpayOrderId}|${razorpay_payment_id}`

        const expectedSignature = crypto
            .createHmac(
                'sha256',
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest('hex')

        const expectedBuffer = Buffer.from(
            expectedSignature,
            'hex'
        )

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            'hex'
        )

        const signatureIsValid =
            /^[a-fA-F0-9]{64}$/.test(razorpay_signature) &&
            expectedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(
                expectedBuffer,
                receivedBuffer
            )

        if (!signatureIsValid) {
            return res.status(400).json({
                message: 'Invalid payment signature'
            })
        }

        order.paymentStatus = 'PAID'
        order.status = 'PLACED'
        order.razorpayPaymentId = razorpay_payment_id

        await order.save()

        const customer = await Customer.findById(req.user._id)

        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found'
            })
        }

        customer.cart = []
        await customer.save()

        return res.status(200).json({
            success: true,
            message: 'Payment verified and order placed',
            order
        })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message: 'Unable to verify payment'
        })
    }
}

const getOrderById = async (req, res) => {
    const { id } = req.params

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid order ID'
            })
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        }).populate('items.product', 'name image')

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        return res.status(200).json({
            success: true,
            order
        })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message: 'Unable to fetch order'
        })
    }
}

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        })
    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message: 'Unable to fetch orders'
        })
    }
}

export {
    createPaymentOrder,
    verifyPayment,
    getOrderById,
    getMyOrders
}
