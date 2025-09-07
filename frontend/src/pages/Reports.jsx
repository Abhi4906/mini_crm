import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../services/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const Reports = () => {
  const [leadStats, setLeadStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeadStats()
  }, [])

  const fetchLeadStats = async () => {
    try {
      const response = await api.get('/leads/stats')
      setLeadStats(response.data)
    } catch (error) {
      console.error('Error fetching lead stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading reports...</div>

  return (
    <div className="reports-page">
      <h1>Reports</h1>
      
      {leadStats.length > 0 ? (
        <div className="charts-container">
          <div className="chart-card">
            <h2>Leads by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leadStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>Lead Value by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalValue" fill="#8884d8" name="Total Value ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stats-table">
            <h2>Lead Statistics</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Total Value</th>
                  <th>Average Value</th>
                </tr>
              </thead>
              <tbody>
                {leadStats.map(stat => (
                  <tr key={stat._id}>
                    <td>{stat._id}</td>
                    <td>{stat.count}</td>
                    <td>${stat.totalValue.toFixed(2)}</td>
                    <td>${(stat.totalValue / stat.count).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td>{leadStats.reduce((sum, stat) => sum + stat.count, 0)}</td>
                  <td>${leadStats.reduce((sum, stat) => sum + stat.totalValue, 0).toFixed(2)}</td>
                  <td>
                    ${(
                      leadStats.reduce((sum, stat) => sum + stat.totalValue, 0) / 
                      leadStats.reduce((sum, stat) => sum + stat.count, 0) || 0
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No lead data available for reports</p>
        </div>
      )}
    </div>
  )
}

export default Reports