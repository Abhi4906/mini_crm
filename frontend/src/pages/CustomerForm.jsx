import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  
  useEffect(() => {
    if (isEdit) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customers/${id}`);
      setFormData(response.data.customer);
    } catch (error) {
      setError('Error fetching customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
      
        await api.put(`/customers/${id}`, formData);
      } else {
       
        const checkRes = await api.get(`/customers?email=${encodeURIComponent(formData.email)}`);
        if (checkRes.data && checkRes.data.customer) {
          setError('A customer with this email already exists.');
          setLoading(false);
          return;
        }

  
        await api.post('/customers', formData);
      }

      navigate('/customers');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving customer');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <div className="loading">Loading customer...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
        <button onClick={() => navigate('/customers')} className="btn-secondary">
          Back to Customers
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
