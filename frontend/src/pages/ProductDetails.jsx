import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const ProductDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {

        const getProduct = async () => {

            try {

                setLoading(true)
                setError('')

                const response = await api.get(`/products/${id}`)

                setProduct(response.data.product)

            } catch (err) {

                console.error(err)

                setError(
                    'Something went wrong while loading the product.'
                )

            } finally {

                setLoading(false)

            }
        }

        getProduct()

    }, [id])

    if (loading) {
        return <h2>Loading product...</h2>
    }

    if (error) {
        return <h2>{error}</h2>
    }

    if (!product) {
        return <h2>Product not found.</h2>
    }

    return (
        <div className="product-details-page">

            <button
                className="back-button"
                onClick={() => navigate('/products')}
            >
                ← Back to Products
            </button>

            <div className="product-details">

                <div className="product-details-image">
                    <img
                        src={product.image}
                        alt={product.name}
                    />
                </div>

                <div className="product-details-info">

                    <p className="product-details-category">
                        {product.category}
                    </p>

                    <h1>{product.name}</h1>

                    <p className="product-details-description">
                        {product.description}
                    </p>

                    <h2 className="product-details-price">
                        ₹{product.price}
                    </h2>

                    <p className="product-details-stock">
                        {product.stock} units available
                    </p>

                    <button className="add-cart-button">
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>
    )
}

export default ProductDetails