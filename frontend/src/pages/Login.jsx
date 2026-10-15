import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const Login = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        if (!formData.email || !formData.password) {
            setError('Email and password are required')
            return
        }

        try {
            setLoading(true)

            await api.post('/customers/login', formData)

            navigate('/home')
        }
        catch (err) {
            if (err.response) {
                setError('Invalid Credentials')
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

                <h1>Welcome Back</h1>

                <p className="auth-subtitle">
                    Login to your ShopKart account
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

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

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

                <p className="auth-link">
                    Don't have an account?{' '}
                    <span onClick={() => navigate('/register')}>
                        Create Account
                    </span>
                </p>

            </div>
        </div>
    )
}

export default Login