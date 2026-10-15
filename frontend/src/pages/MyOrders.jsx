import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

const MyOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders')
                setOrders(data.orders)
            } catch (err) {
                console.error(err)
                setError(
                    err.response?.data?.message ||
                    'Unable to load your orders.'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    return (
        <>
            <Navbar />

            <main className="my-orders-page">
                <div className="my-orders-container">
                    <h1>My Orders</h1>
                    <p className="my-orders-subtitle">
                        View your purchases and payment status.
                    </p>

                    {loading ? (
                        <p>Loading your orders...</p>
                    ) : error ? (
                        <div className="orders-message error">
                            {error}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="orders-empty">
                            <h2>No orders yet</h2>
                            <p>Your purchases will appear here.</p>
                            <Link to="/products">
                                Explore Products
                            </Link>
                        </div>
                    ) : (
                        <div className="my-orders-list">
                            {orders.map((order) => (
                                <article
                                    className="my-order-card"
                                    key={order._id}
                                >
                                    <div className="my-order-header">
                                        <div>
                                            <p className="order-label">
                                                Order ID
                                            </p>
                                            <strong>{order._id}</strong>
                                        </div>

                                        <div className="order-date">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="my-order-statuses">
                                        <span className={`order-status ${order.status.toLowerCase()}`}>
                                            {order.status.replaceAll('_', ' ')}
                                        </span>

                                        <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                                            Payment: {order.paymentStatus}
                                        </span>
                                    </div>

                                    <div className="my-order-items">
                                        {order.items.map((item, index) => (
                                            <div
                                                className="my-order-item"
                                                key={`${item.product?._id || item.product}-${index}`}
                                            >
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                    />
                                                )}

                                                <div className="my-order-item-info">
                                                    <strong>{item.name}</strong>
                                                    <p>Quantity: {item.quantity}</p>
                                                </div>

                                                <strong>
                                                    ₹{(
                                                        item.price * item.quantity
                                                    ).toLocaleString('en-IN')}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="my-order-footer">
                                        <span>Total Amount</span>
                                        <strong>
                                            ₹{order.totalAmount.toLocaleString('en-IN')}
                                        </strong>
                                    </div>

                                    <Link
                                        to={`/order-success/${order._id}`}
                                        className="view-order-link"
                                    >
                                        View Order Details
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

export default MyOrders