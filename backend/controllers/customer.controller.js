import bcrypt from 'bcrypt'
import Customer from '../models/customer.model.js'
import generateToken from '../utils/generateToken.js'

const registerCustomer = async (req, res) => {
    const { fullName, password, email, phone } = req.body

    try {
        if (!fullName || !password || !email || !phone) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must contain atleast 6 characters'
            })
        }

        const existingCustomer = await Customer.findOne({ email })

        if (existingCustomer) {
            return res.status(409).json({
                message: 'Email already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        })

        return res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        })
    }
    catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


const loginCustomer = async (req, res) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            })
        }

        const customer = await Customer.findOne({ email })

        if (!customer) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        const passwordMatch = await bcrypt.compare(
            password,
            customer.password
        )

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        const token = generateToken(customer._id)

        res.cookie('token', token, {
            httpOnly: true
        })

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        })
    }
    catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


const getMyProfile = async (req, res) => {

    try {

        return res.status(200).json({
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            phone: req.user.phone
        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie('token')

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })
    }
    catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Old password and new password are required'
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'New password must contain atleast 6 characters'
            })
        }

        const customer = await Customer.findById(req.user._id)

        const passwordMatch = await bcrypt.compare(
            oldPassword,
            customer.password
        )

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Old password is incorrect'
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        customer.password = hashedPassword

        await customer.save()

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        })
    }
    catch (err) {
        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


export {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer,
    changePassword
}