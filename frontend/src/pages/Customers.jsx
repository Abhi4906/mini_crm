import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Pagination from '../components/Pagination'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/customers?page=${currentPage}&search=${searchTerm}`)
      setCustomers(response.data.customers)
      setTotalPages(response.data.totalPages)
      setTotalCustomers(response.data.totalCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`)
        fetchCustomers()
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  if (loading) return <div className="loading">Loading customers...</div>

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <Link to="/customers/new" className="btn-primary">Add Customer</Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container">
        {customers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <Link to={`/customers/${customer._id}`} className="link">
                      {customer.name}
                    </Link>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.company || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/customers/${customer._id}`}
                        className="btn-secondary btn-sm"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/customers/${customer._id}/edit`}
                        className="btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(customer._id)}
                        className="btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No customers found</p>
            <Link to="/customers/new" className="btn-primary">Add your first customer</Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <div className="total-count">
        Showing {customers.length} of {totalCustomers} customers
      </div>
    </div>
  )
}

export default Customers