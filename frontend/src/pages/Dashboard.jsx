import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({ customers: 0, leads: 0, leadStats: [] })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [customersRes, leadsRes, statsRes] = await Promise.all([
          api.get('/customers?limit=5'),
          api.get('/leads?limit=5'),
          api.get('/leads/stats')
        ])

        setStats({
          customers: customersRes.data.totalCustomers,
          leads: leadsRes.data.length,
          leadStats: statsRes.data
        })
        setRecentLeads(leadsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-number">{stats.customers}</p>
          <Link to="/customers" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Total Leads</h3>
          <p className="stat-number">{stats.leads}</p>
          <Link to="/customers" className="stat-link">View All</Link>
        </div>
        
        {stats.leadStats.map(stat => (
          <div key={stat._id} className="stat-card">
            <h3>{stat._id} Leads</h3>
            <p className="stat-number">{stat.count}</p>
            <p>Value: ${stat.totalValue}</p>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h2>Recent Leads</h2>
        {recentLeads.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead._id}>
                  <td>{lead.title}</td>
                  <td>{lead.customerId?.name}</td>
                  <td>
                    <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>${lead.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leads found</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard