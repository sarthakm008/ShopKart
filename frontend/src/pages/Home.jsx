import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Home() {
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        const getCustomer = async () => {
            try {
                const response = await api.get('/customers/me')
                setCustomer(response.data)
            } catch (error) {
                console.error('Authentication failed:', error)
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }

        getCustomer()
    }, [navigate])

    if (loading) {
        return <h2>Loading...</h2>
    }

    if (!customer) {
        return null
    }

    return (
        <>
            <Navbar />

            <main className="home-page">

                <section className="hero-section">
                    <div>
                        <p className="hero-label">SHOPKART</p>

                        <h1>
                            Welcome back,
                            <br />
                            <span>{customer.fullName}</span>
                        </h1>

                        <p className="hero-description">
                            Discover products you'll love, all in one place.
                        </p>

                        <button
                            className="shop-button"
                            onClick={() => navigate('/products')}
                        >
                            Start Shopping
                        </button>
                    </div>
                </section>

                <section className="profile-section">

                    <div className="section-heading">
                        <p>YOUR ACCOUNT</p>
                        <h2>Customer Information</h2>
                    </div>

                    <div className="profile-card">

                        <div className="profile-avatar">
                            {customer.fullName.charAt(0).toUpperCase()}
                        </div>

                        <div className="profile-details">

                            <div className="profile-item">
                                <span>Name</span>
                                <strong>{customer.fullName}</strong>
                            </div>

                            <div className="profile-item">
                                <span>Email</span>
                                <strong>{customer.email}</strong>
                            </div>

                            <div className="profile-item">
                                <span>Phone</span>
                                <strong>{customer.phone}</strong>
                            </div>

                        </div>

                    </div>

                </section>

            </main>
        </>
    )
}

export default Home