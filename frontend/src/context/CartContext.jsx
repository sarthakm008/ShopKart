import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react'

import api from '../services/api.js'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const getCart = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await api.get('/cart')

            setCartItems(response.data.cart)
        } catch (err) {
            console.error(err)
            setError('Unable to load your cart.')
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async (productId) => {
        const response = await api.post(`/cart/${productId}`)

        setCartItems(response.data.cart)

        return response.data
    }

    const updateQuantity = async (productId, quantity) => {
        const response = await api.patch(
            `/cart/${productId}`,
            { quantity }
        )

        setCartItems(response.data.cart)

        return response.data
    }

    const removeFromCart = async (productId) => {
        const response = await api.delete(`/cart/${productId}`)

        setCartItems(response.data.cart)

        return response.data
    }

    useEffect(() => {
        getCart()
    }, [])

    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,
                loading,
                error,
                getCart,
                addToCart,
                updateQuantity,
                removeFromCart
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    return useContext(CartContext)
}