import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Mini CRM</Link>
      </div>
      
      {isAuthenticated && (
        <div className="navbar-menu">
          <div className="navbar-items">
            <Link to="/" className="navbar-item">Dashboard</Link>
            <Link to="/customers" className="navbar-item">Customers</Link>
            <Link to="/reports" className="navbar-item">Reports</Link>
          </div>
          
          <div className="navbar-user">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar