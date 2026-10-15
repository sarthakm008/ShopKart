import { useEffect, useState } from 'react'
import api from '../services/api.js'

import ProductCard from '../components/ProductCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Navbar from '../components/Navbar.jsx'

const Products = () => {
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')

    const [wishlistIds, setWishlistIds] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const getProducts = async () => {
            try {
                setLoading(true)
                setError('')

                const response = await api.get('/products', {
                    params: {
                        search,
                        category
                    }
                })

                setProducts(response.data.products)

            } catch (err) {
                console.error(err)

                setError(
                    'Something went wrong while loading products.'
                )
            } finally {
                setLoading(false)
            }
        }

        getProducts()
    }, [search, category])

    useEffect(() => {
        const getWishlist = async () => {
            try {
                const response = await api.get('/wishlist')

                const ids = response.data.wishlist.map(
                    (product) => product._id
                )

                setWishlistIds(ids)

            } catch (err) {
                console.error('Failed to load wishlist:', err)
            }
        }

        getWishlist()
    }, [])

    return (
        <>
            <Navbar />

            <div className="products-page">

                <div className="products-header">
                    <h1>ShopKart Products</h1>
                    <p>Browse our collection of products</p>
                </div>

                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                />

                {loading && (
                    <h2>Loading products...</h2>
                )}

                {error && (
                    <h2>{error}</h2>
                )}

                {!loading && !error && products.length === 0 && (
                    <h2>No products found.</h2>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                initialWishlisted={wishlistIds.includes(
                                    product._id
                                )}
                            />
                        ))}
                    </div>
                )}

            </div>
        </>
    )
}

export default Products