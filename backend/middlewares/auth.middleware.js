import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js'

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: 'Not authenticated'
        })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.jwtSecret
        )

        const customer = await Customer.findById(decoded.id).select('-password')

        if (!customer) {
            return res.status(401).json({
                message: 'Customer not found'
            })
        }

        req.user = customer

        next()

    } catch (err) {
        console.log(err)

        return res.status(401).json({
            message: 'Invalid token'
        })
    }
}

export default authMiddleware