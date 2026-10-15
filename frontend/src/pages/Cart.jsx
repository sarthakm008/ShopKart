import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useCart } from '../context/CartContext.jsx'

const Cart = () => {
    const navigate = useNavigate()

    const {
        cartItems,
        loading,
        error,
        updateQuantity,
        removeFromCart
    } = useCart()

    const handleIncrease = async (productId, quantity, stock) => {
        if (quantity >= stock) {
            return
        }

        try {
            await updateQuantity(productId, quantity + 1)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDecrease = async (productId, quantity) => {
        if (quantity <= 1) {
            return
        }

        try {
            await updateQuantity(productId, quantity - 1)
        } catch (err) {
            console.error(err)
        }
    }

    const handleRemove = async (productId) => {
        try {
            await removeFromCart(productId)
        } catch (err) {
            console.error(err)
        }
    }

    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    )

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    )

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="cart-page">
                    <h2>Loading your cart...</h2>
                </main>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className="cart-page">
                    <div className="cart-error">
                        <h2>Unable to load your cart.</h2>
                        <button onClick={() => window.location.reload()}>
                            Try Again
                        </button>
                    </div>
                </main>
            </>
        )
    }

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <main className="cart-page">
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🛒</div>

                        <h2>Your cart is empty</h2>

                        <p>
                            Looks like you haven't added anything yet.
                        </p>

                        <button onClick={() => navigate('/products')}>
                            Browse Products
                        </button>
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <Navbar />

            <main className="cart-page">
                <div className="cart-header">
                    <p>SHOPKART</p>
                    <h1>My Cart</h1>
                </div>

                <div className="cart-content">

                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div
                                className="cart-item"
                                key={item.product._id}
                            >
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                />

                                <div className="cart-item-info">
                                    <p>{item.product.category}</p>

                                    <h2>
                                        {item.product.name}
                                    </h2>

                                    <p>
                                        ₹{item.product.price}
                                    </p>

                                    <div className="quantity-controls">
                                        <button
                                            onClick={() =>
                                                handleDecrease(
                                                    item.product._id,
                                                    item.quantity
                                                )
                                            }
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>

                                        <span>
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                handleIncrease(
                                                    item.product._id,
                                                    item.quantity,
                                                    item.product.stock
                                                )
                                            }
                                            disabled={
                                                item.quantity >=
                                                item.product.stock
                                            }
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.product._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="cart-summary-row">
                            <span>Items</span>
                            <span>{totalItems}</span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>

                        <button onClick={() => navigate('/checkout')}>
                            Proceed to Checkout
                        </button>
                    </div>

                </div>
            </main>
        </>
    )
}

export default Cart