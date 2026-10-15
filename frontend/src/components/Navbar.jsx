import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext.jsx'

const Navbar = () => {
    const navigate = useNavigate()
    const { cartItems } = useCart()

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    )

    const handleLogout = async () => {
        try {
            await api.post('/customers/logout')
            navigate('/login')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <div
                    className="logo"
                    onClick={() => navigate('/home')}
                >
                    ShopKart
                </div>

                <div className="nav-links">

                    <button onClick={() => navigate('/home')}>
                        Home
                    </button>

                    <button onClick={() => navigate('/products')}>
                        Products
                    </button>

                    <button onClick={() => navigate('/wishlist')}>
                        Wishlist
                    </button>

                    <button onClick={() => navigate('/orders')}>
                        My Orders
                    </button>

                    <button onClick={() => navigate('/cart')}>
                        Cart ({cartCount})
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </div>
        </nav>
    )
}

export default Navbar