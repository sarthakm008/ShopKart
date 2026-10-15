import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

const OrderSuccess = () => {
    const { id } = useParams()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`)
                setOrder(data.order)
            } catch (err) {
                console.error(err)
                setError(
                    err.response?.data?.message ||
                    'Unable to load order details.'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [id])

    return (
        <>
            <Navbar />

            <main className="order-success-page">
                {loading ? (
                    <p>Loading your order...</p>
                ) : error ? (
                    <section className="order-success-card">
                        <h2>Unable to load order</h2>
                        <p>{error}</p>
                        <Link to="/orders">View My Orders</Link>
                    </section>
                ) : order ? (
                    <section className="order-success-card">
                        <div className="success-icon">✓</div>

                        <h1>Order Placed Successfully!</h1>

                        <p>
                            Thank you for shopping with ShopKart.
                            Your payment has been verified.
                        </p>

                        <div className="order-success-details">
                            <p>
                                <strong>Order ID:</strong> {order._id}
                            </p>

                            <p>
                                <strong>Payment:</strong>{' '}
                                {order.paymentStatus}
                            </p>

                            <p>
                                <strong>Order Status:</strong>{' '}
                                {order.status}
                            </p>

                            <p>
                                <strong>Total:</strong>{' '}
                                ₹{order.totalAmount.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <h2>Items Ordered</h2>

                        <div className="success-order-items">
                            {order.items.map((item, index) => (
                                <div
                                    className="success-order-item"
                                    key={`${item.product?._id || item.product}-${index}`}
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                        />
                                    )}

                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>
                                            ₹{item.price.toLocaleString('en-IN')}
                                            {' '}each
                                        </p>
                                    </div>

                                    <strong>
                                        ₹{(
                                            item.price * item.quantity
                                        ).toLocaleString('en-IN')}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="order-success-actions">
                            <Link to="/orders" className="success-primary-btn">
                                View My Orders
                            </Link>

                            <Link to="/" className="success-secondary-btn">
                                Continue Shopping
                            </Link>
                        </div>
                    </section>
                ) : null}
            </main>
        </>
    )
}

export default OrderSuccess