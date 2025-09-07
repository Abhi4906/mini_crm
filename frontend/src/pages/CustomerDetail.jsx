import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

const CustomerDetail = () => {
  const [customer, setCustomer] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    fetchCustomerDetails()
  }, [id])

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/customers/${id}`)
      setCustomer(response.data.customer)
      setLeads(response.data.leads)
    } catch (error) {
      console.error('Error fetching customer details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${leadId}`)
        fetchCustomerDetails()
      } catch (error) {
        console.error('Error deleting lead:', error)
      }
    }
  }

  if (loading) return <div className="loading">Loading customer details...</div>
  if (!customer) return <div>Customer not found</div>

  return (
    <div className="customer-detail">
      <div className="page-header">
        <h1>{customer.name}</h1>
        <div className="header-actions">
          <Link to={`/customers/${id}/edit`} className="btn-secondary">Edit Customer</Link>
          <Link to={`/leads/new?customerId=${id}`} className="btn-primary">Add Lead</Link>
        </div>
      </div>

      <div className="customer-info">
        <div className="info-grid">
          <div className="info-item">
            <label>Email</label>
            <p>{customer.email}</p>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <p>{customer.phone || '-'}</p>
          </div>
          <div className="info-item">
            <label>Company</label>
            <p>{customer.company || '-'}</p>
          </div>
        </div>
      </div>

      <div className="leads-section">
        <h2>Leads</h2>
        {leads.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Value</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td>{lead.title}</td>
                  <td>{lead.description || '-'}</td>
                  <td>
                    <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>${lead.value}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/leads/${lead._id}/edit`}
                        className="btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteLead(lead._id)}
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
            <p>No leads found for this customer</p>
            <Link to={`/leads/new?customerId=${id}`} className="btn-primary">Add your first lead</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerDetail