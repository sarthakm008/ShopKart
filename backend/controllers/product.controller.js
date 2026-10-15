import Product from '../models/product.model.js'


const createProduct = async (req, res) => {

    const {
        name,
        description,
        price,
        category,
        image,
        stock
    } = req.body

    try {

        if (
            !name ||
            !description ||
            !category ||
            !image ||
            price === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        if (price <= 0) {
            return res.status(400).json({
                message: 'Price must be greater than 0'
            })
        }

        if (stock < 0) {
            return res.status(400).json({
                message: 'Stock cannot be negative'
            })
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        })

        return res.status(201).json({
            success: true,
            product
        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


const getAllProducts = async (req, res) => {

    const { search, category } = req.query

    try {

        const filter = {}

        if (search) {
            filter.name = {
                $regex: search,
                $options: 'i'
            }
        }

        if (category) {
            filter.category = category
        }

        const products = await Product.find(filter)

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server error'
        })
    }
}


const getProductById = async (req, res) => {

    const { id } = req.params

    try {

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }

        return res.status(200).json({
            success: true,
            product
        })

    } catch (err) {

        console.log(err)

        return res.status(400).json({
            message: 'Invalid product ID'
        })
    }
}


export {
    createProduct,
    getAllProducts,
    getProductById
}