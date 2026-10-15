import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import Navbar from '../components/Navbar.jsx'

const Wishlist = () => {
    const navigate = useNavigate()

    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const getWishlist = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await api.get('/wishlist')

            setWishlist(response.data.wishlist)

        } catch (err) {
            console.error(err)

            setError(
                "We couldn't load your wishlist."
            )

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getWishlist()
    }, [])

    const handleRemove = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}`)

            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            )

        } catch (err) {
            console.error(err)

            alert('Unable to remove product. Please try again.')
        }
    }

    return (
        <>
            <Navbar />

            <main className="wishlist-page">

                <div className="wishlist-header">
                    <p>SHOPKART</p>

                    <h1>My Wishlist</h1>

                    {!loading && !error && (
                        <span>
                            {wishlist.length} products saved
                        </span>
                    )}
                </div>

                {loading && (
                    <h2>Loading your wishlist...</h2>
                )}

                {error && (
                    <div className="wishlist-error">
                        <h2>Something went wrong.</h2>

                        <p>{error}</p>

                        <button onClick={getWishlist}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && wishlist.length === 0 && (
                    <div className="wishlist-empty">
                        <div className="wishlist-empty-icon">
                            ❤️
                        </div>

                        <h2>Your wishlist is empty</h2>

                        <p>
                            Save products you love and find them here later.
                        </p>

                        <button
                            onClick={() => navigate('/products')}
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {!loading && !error && wishlist.length > 0 && (
                    <div className="wishlist-grid">

                        {wishlist.map((product) => (
                            <div
                                className="wishlist-card"
                                key={product._id}
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                />

                                <div className="wishlist-card-info">

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
                                            navigate(
                                                `/products/${product._id}`
                                            )
                                        }
                                    >
                                        View Details
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleRemove(product._id)
                                        }
                                    >
                                        Remove ♥
                                    </button>

                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </main>
        </>
    )
}

export default Wishlist