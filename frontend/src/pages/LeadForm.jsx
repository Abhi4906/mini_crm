import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'

const LeadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New',
    value: 0,
    customerId: ''
  })
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)

  useEffect(() => {
    fetchCustomers()
    if (isEdit) {
      fetchLead()
    } else {
      const customerId = searchParams.get('customerId')
      if (customerId) {
        setFormData(prev => ({ ...prev, customerId }))
      }
    }
  }, [id])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers?limit=100')
      setCustomers(response.data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchLead = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/leads/${id}`)
      console.log('Lead data fetched:', response.data) 

      
      const leadData = response.data.lead || response.data

      setFormData({
        title: leadData.title || '',
        description: leadData.description || '',
        status: leadData.status || 'New',
        value: leadData.value || 0,
        customerId: leadData.customerId || ''
      })
    } catch (error) {
      setError('Error fetching lead')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        await api.put(`/leads/${id}`, formData)
      } else {
        await api.post('/leads', formData)
      }
      navigate(formData.customerId ? `/customers/${formData.customerId}` : '/customers')
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving lead')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) return <div className="loading">Loading lead...</div>

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Lead' : 'Add Lead'}</h1>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Customer *</label>
          <select
            name="customerId"
            value={formData.customerId || ''}
            onChange={handleChange}
            required
            disabled={isEdit || Boolean(searchParams.get('customerId'))}
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select
            name="status"
            value={formData.status || 'New'}
            onChange={handleChange}
            required
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div className="form-group">
          <label>Value ($)</label>
          <input
            type="number"
            name="value"
            value={formData.value || 0}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Lead' : 'Add Lead')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeadForm
