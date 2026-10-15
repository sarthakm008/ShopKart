import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const Register = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')

        if (
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.phone
        ) {
            setError('All fields are required')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must contain at least 6 characters')
            return
        }

        try {
            setLoading(true)

            await api.post('/customers/register', formData)

            navigate('/login')
        }
        catch (err) {
            if (err.response) {
                setError(
                    err.response.data.message ||
                    'Registration failed'
                )
            }
            else {
                setError('Unable to connect to server')
            }
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">

                <div className="auth-brand">
                    ShopKart
                </div>

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Join ShopKart today
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>

                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Creating Account...'
                            : 'Create Account'
                        }
                    </button>

                </form>

                <p className="auth-link">
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')}>
                        Login
                    </span>
                </p>

            </div>
        </div>
    )
}

export default Register