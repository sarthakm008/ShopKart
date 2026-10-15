
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import { useCart } from '../context/CartContext.jsx'
import api from '../services/api.js'


const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script')

        script.src = 'https://checkout.razorpay.com/v1/checkout.js'

        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)

        document.body.appendChild(script)
    })
}


const Checkout = () => {
    const navigate = useNavigate()

    const {
        cartItems,
        loading,
        error,
        setCartItems
    } = useCart()

    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    })

    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    )

    const totalAmount = cartItems.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    )

    const handleChange = (event) => {
        const { name, value } = event.target

        setShippingAddress((previous) => ({
            ...previous,
            [name]: value
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        Object.entries(shippingAddress).forEach(([field, value]) => {
            if (!value.trim()) {
                newErrors[field] = 'This field is required.'
            }
        })

        if (
            shippingAddress.phone.trim() &&
            !/^\d{10}$/.test(shippingAddress.phone.trim())
        ) {
            newErrors.phone = 'Enter a valid 10-digit phone number.'
        }

        if (
            shippingAddress.pincode.trim() &&
            !/^\d{6}$/.test(shippingAddress.pincode.trim())
        ) {
            newErrors.pincode = 'Pincode must contain 6 digits.'
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }


    const handleSubmit = async (event) => {
        event.preventDefault()
        setFormError('')

        if (!validateForm()) {
            return
        }

        if (submitting) {
            return
        }

        setSubmitting(true)

        try {
            // Load Razorpay Checkout
            const scriptLoaded = await loadRazorpayScript()

            if (!scriptLoaded || !window.Razorpay) {
                throw new Error(
                    'Unable to load Razorpay. Please try again.'
                )
            }

            // Ask the backend to validate the cart and create
            // both the ShopKart order and Razorpay order.
            const { data } = await api.post(
                '/orders/create-payment-order',
                { shippingAddress }
            )

            // Configure Razorpay Checkout
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'ShopKart',
                description: 'ShopKart Order',
                order_id: data.razorpayOrderId,

                prefill: {
                    name: shippingAddress.fullName,
                    contact: shippingAddress.phone
                },

                handler: async (paymentResponse) => {
                    try {
                        // The browser's callback is not trusted
                        // until the backend verifies the signature.
                        const verification = await api.post(
                            '/orders/verify-payment',
                            {
                                shopKartOrderId: data.shopKartOrderId,
                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,
                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,
                                razorpay_signature:
                                    paymentResponse.razorpay_signature
                            }
                        )

                        if (!verification.data.success) {
                            throw new Error(
                                'Payment verification was unsuccessful.'
                            )
                        }

                        // Clear shared cart state only after the
                        // backend confirms successful verification.
                        setCartItems([])

                        navigate(
                            `/order-success/${data.shopKartOrderId}`,
                            {
                                state: {
                                    order: verification.data.order
                                }
                            }
                        )
                    } catch (err) {
                        console.error(err)

                        setFormError(
                            err.response?.data?.message ||
                            'Payment verification failed. Please contact support if money was deducted.'
                        )

                        setSubmitting(false)
                    }
                },

                modal: {
                    ondismiss: () => {
                        setSubmitting(false)
                    }
                },

                theme: {
                    color: '#111827'
                }
            }

            const paymentObject = new window.Razorpay(options)

            paymentObject.on('payment.failed', (response) => {
                console.error('Razorpay payment failed:', response.error)

                setFormError(
                    response.error?.description ||
                    'Payment failed. Your cart has not been cleared.'
                )

                setSubmitting(false)
            })

            paymentObject.open()
        } catch (err) {
            console.error(err)

            setFormError(
                err.response?.data?.message ||
                err.message ||
                'Unable to start checkout. Please try again.'
            )

            setSubmitting(false)
        }
    }


    if (loading) {
        return (
            <>
                <Navbar />
                <main className="checkout-page">
                    <p>Loading your cart...</p>
                </main>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className="checkout-page">
                    <h2>Unable to load your cart.</h2>
                    <p>Please try again later.</p>
                </main>
            </>
        )
    }

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <main className="checkout-page">
                    <h1>Your cart is empty</h1>
                    <p>Add products before proceeding to checkout.</p>

                    <button onClick={() => navigate('/products')}>
                        Browse Products
                    </button>
                </main>
            </>
        )
    }

    return (
        <>
            <Navbar />

            <main className="checkout-page">
                <header className="checkout-header">
                    <p>SHOPKART</p>
                    <h1>Checkout</h1>
                </header>

                <div className="checkout-layout">
                    <form
                        className="checkout-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <h2>Shipping Details</h2>

                        <div className="checkout-field">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                value={shippingAddress.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && (
                                <p className="field-error">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={shippingAddress.phone}
                                onChange={handleChange}
                                placeholder="10-digit phone number"
                            />
                            {errors.phone && (
                                <p className="field-error">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="addressLine1">
                                Address Line
                            </label>
                            <input
                                id="addressLine1"
                                name="addressLine1"
                                value={shippingAddress.addressLine1}
                                onChange={handleChange}
                                placeholder="House number, street, area"
                            />
                            {errors.addressLine1 && (
                                <p className="field-error">
                                    {errors.addressLine1}
                                </p>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="city">City</label>
                            <input
                                id="city"
                                name="city"
                                value={shippingAddress.city}
                                onChange={handleChange}
                                placeholder="Enter your city"
                            />
                            {errors.city && (
                                <p className="field-error">
                                    {errors.city}
                                </p>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="state">State</label>
                            <input
                                id="state"
                                name="state"
                                value={shippingAddress.state}
                                onChange={handleChange}
                                placeholder="Enter your state"
                            />
                            {errors.state && (
                                <p className="field-error">
                                    {errors.state}
                                </p>
                            )}
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="pincode">Pincode</label>
                            <input
                                id="pincode"
                                name="pincode"
                                inputMode="numeric"
                                maxLength={6}
                                value={shippingAddress.pincode}
                                onChange={handleChange}
                                placeholder="6-digit pincode"
                            />
                            {errors.pincode && (
                                <p className="field-error">
                                    {errors.pincode}
                                </p>
                            )}
                        </div>

                        {formError && (
                            <p className="checkout-message">
                                {formError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="checkout-submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>

                    <aside className="checkout-summary">
                        <h2>Order Summary</h2>

                        {cartItems.map((item) => (
                            <div
                                className="checkout-summary-item"
                                key={item.product._id}
                            >
                                <div>
                                    <p>{item.product.name}</p>
                                    <span>
                                        Qty: {item.quantity}
                                    </span>
                                </div>

                                <strong>
                                    ₹{(
                                        item.product.price *
                                        item.quantity
                                    ).toLocaleString('en-IN')}
                                </strong>
                            </div>
                        ))}

                        <div className="checkout-summary-row">
                            <span>Total items</span>
                            <span>{totalItems}</span>
                        </div>

                        <div className="checkout-summary-row checkout-total">
                            <span>Total</span>
                            <span>
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    )
}

export default Checkout
