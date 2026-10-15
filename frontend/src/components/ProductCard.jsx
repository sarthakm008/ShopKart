import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'

const ProductCard = ({ product, initialWishlisted }) => {
    const navigate = useNavigate()

    const [saving, setSaving] = useState(false)
    const [wishlisted, setWishlisted] = useState(initialWishlisted)
    const [error, setError] = useState('')

    const { cartItems, addToCart } = useCart()

    const [addingToCart, setAddingToCart] = useState(false)
    const [cartError, setCartError] = useState('')

    useEffect(() => {
        setWishlisted(initialWishlisted)
    }, [initialWishlisted])

    const handleWishlist = async () => {
        try {
            setSaving(true)
            setError('')

            await api.post(`/wishlist/${product._id}`)

            setWishlisted(true)

        } catch (err) {
            console.error(err)

            if (err.response?.status === 409) {
                setWishlisted(true)
                setError('Product is already in your wishlist.')
            } else {
                setError('Unable to save product. Please try again.')
            }

        } finally {
            setSaving(false)
        }
    }

    const handleAddToCart = async () => {
        try {
            setAddingToCart(true)
            setCartError('')

            await addToCart(product._id)
        } catch (err) {
            console.error(err)

            setCartError(
                err.response?.data?.message ||
                'Unable to add product to cart.'
            )
        } finally {
            setAddingToCart(false)
        }
    }

    const cartItem = cartItems.find(
        (item) => item.product?._id === product._id
    )

    return (
        <div className="product-card">

            <img
                src={product.image}
                alt={product.name}
            />

            <div className="product-info">

                <p className="product-category">
                    {product.category}
                </p>

                <h2>{product.name}</h2>

                <p className="product-price">
                    ₹{product.price}
                </p>

                <p className="product-stock">
                    {product.stock} units left
                </p>

                <button
                    onClick={() =>
                        navigate(`/products/${product._id}`)
                    }
                >
                    View Details
                </button>

                <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                >
                    {addingToCart
                        ? 'Adding...'
                        : cartItem
                            ? 'Add Another'
                            : 'Add to Cart'}
                </button>

                {cartError && (
                    <p className="error-message">
                        {cartError}
                    </p>
                )}

                <button
                    onClick={handleWishlist}
                    disabled={saving || wishlisted}
                >
                    {saving
                        ? '⏳ Saving...'
                        : wishlisted
                            ? '♥ Added to Wishlist'
                            : '♡ Add to Wishlist'
                    }
                </button>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

            </div>
        </div>
    )
}

export default ProductCard